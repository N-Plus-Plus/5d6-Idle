document.addEventListener(`DOMContentLoaded`, function () { onLoad(); } );
window.addEventListener("mousedown", function (e) { clicked( e ); } );
window.addEventListener("keydown", function(e) { pressed( e ) } );
window.addEventListener('contextmenu', function (e) { e.preventDefault(); }, false);
document.addEventListener('visibilitychange', function (e) { if( !document.hidden ){ catchUp(); } } );
document.addEventListener('mousedown', (e) => { mouseDown( e ); } );
document.addEventListener('mouseup', (e) => { mouseUp(); } );
window.addEventListener('resize', (e) => { resize(); } );

function onLoad(){
    loadGame();
    buildUpgradeMenu();
    updateHeader();
    updatePipCost();
    updatePrices();
    buildDice();
    updateFaces( `all` );
    showUnfolded();
    showPpr();
    updateAscCosts();
    conditionalShow();
    if( game.prestige.watermark > 0 ){
        document.querySelectorAll(`.banner`)[0].innerHTML = ``;
        document.querySelectorAll(`.banner`)[1].innerHTML = ``;
    }
    resize();
}

function clicked( e ){
    let t = e.target;
    let c = t.classList;
    if( c.contains( `on`) ){
        let d = t.getAttribute(`data-die`);
        let f = t.getAttribute(`data-ref`);
        if( e.button == 0 ){ modPips( d, f, true ); }
        else{ modPips( d, f, false ); }
    }
    else if( c.contains(`upgrade`) ){
        if( e.button == 0 ){ buyUpgrade( t.getAttribute(`data-ref`) ); }
        else{ buyAllUpgrades( t.getAttribute(`data-ref`) ); }
    }
    else if( c.contains(`buyPip`) ){
        if( e.button == 0 ){ buyPip(); }
        else{ buyAllPips(); }
    }
    else if( c.contains(`modal`) || c.contains(`close`) ){ showModal(); }
    else if( c.contains(`ascend`) ){ ascendDie( t.getAttribute(`data-ascref`) ); }
    else if( c.contains(`spin`) ){ manualSpin(); }
    else if( c.contains(`spendPP`) ){ ppModal(); }
    else if( c.contains(`buyPerk`) ){ buyPerk( t.getAttribute(`data-ref`) ); }
    else if( c.contains(`prestige`) ){ prestige(); }
    else if( c.contains(`info`) ){ infoModal(); }
    else if( c.contains(`hardReset`) ){ hardReset(); }
    else if( c.contains(`softReset`) ){ softReset(); }
    else if( c.contains(`achievements`) ){ achieveModal(); }
}

function mouseDown( e ){
    game.volatile.mouseDown = true;
    game.volatile.mouseCount = 0;
    game.volatile.mouseTarget = e;
}

function mouseUp(){
    game.volatile.mouseDown = false;
    game.volatile.mouseCount = null;
    game.volatile.mouseTarget = null;
}

function resize(){
    let w = window.innerWidth;
    let h = window.innerHeight;
    let u = w;
    if( h < w ){ u = h; }
    let rem = u / 85.5;
    let t = document.getElementById(`root`);
    t.style = `font-size: ${rem}px;`
}

function tickDown(){
    game.volatile.ttnr -= game.tickTime;
    document.querySelector(`.autoTick`).style.width = `${Math.min( 1, game.volatile.ttnr / ( ( game.baseTTNR * getPerk( `autoTime` ) ) ) ) * 100 + "%"}`;
    if( game.volatile.ttnr <= 0 ){ spinAll(); game.rolls.auto++; checkAchieve( `infinite`, `rolls`, game.rolls.auto, `auto` ); }
    if( game.volatile.mouseDown ){
        if( game.volatile.mouseCount < 10 ){ game.volatile.mouseCount++; }
        else{ clicked( game.volatile.mouseTarget ); }
    }
}

function pressed( e ){
    if( e.key == ` ` ){ manualSpin(); }
    if( e.key == `1` ){ ascendDie( 0 ); }
    if( e.key == `2` ){ ascendDie( 1 ); }
    if( e.key == `3` ){ ascendDie( 2 ); }
    if( e.key == `4` ){ ascendDie( 3 ); }
    if( e.key == `5` ){ ascendDie( 4 ); }
    if( e.key == `p` ){ buyPip(); }
}

function buildDice(){
    for( let i = 0; i < 5; i++ ){
        let t = document.getElementById(`d${i}`);
        let c = document.createElement(`div`);
        c.classList = `cube`;
        for( n in ord ){
            let f = document.createElement(`div`);
            f.classList = `edit ${ord[n]}`;
            c.appendChild( f );
        }
        t.appendChild( c );
    }
}

function showUnfolded(){
    let kill = document.querySelectorAll(`.unfoldedContainer`);
    for( let k = 0; k < kill.length; k++ ){ kill[k].parentElement.remove(kill[k]); }
    let us = document.querySelectorAll(`.unfolded`);
    let flip = false;
    for( let i = 0; i < us.length; i++ ){
        let u = document.createElement(`div`);
        u.classList = `unfoldedBox`;
        if( flip ){ u.classList.add(`flipped`); }
        let f = 0;
        let cont = document.createElement(`div`);
        cont.classList.add(`unfoldedContainer`);
        for( let j = 0; j < 4; j++ ){
            let r = document.createElement(`div`);
            r.classList = `row`;
            for( ii = 0; ii < 3; ii++ ){
                let c = document.createElement(`div`);
                c.classList = `column`;
                if( ii == 1 || j == 1 ){
                    c.classList.add(`on`);
                    c.innerHTML = `
                        <div class="face modDice f${game.dice[i].faces[f]}"></div>`
                    c.setAttribute( `data-ref`, f );
                    c.setAttribute( `data-die`, i );
                    f++;
                }
                r.appendChild(c);
            }
            cont.appendChild( r );
        }
        u.appendChild( cont );
        us[i].appendChild( u );
        flip = !flip;
    }
}

function updateFaces( t ){
    if( t == `all` ){
        for( let j = 0; j < game.dice.length; j++ ){
            let d = document.getElementById(`d${j}`).children[0];
            for( let i = 0; i < 6; i++ ){
                d.children[i].classList = `${ord[i]} f${game.dice[j].faces[i]} edit`;
                let a = game.dice[j].asc % 7;
                d.children[i].style = `border: solid var(--asc${a}b ); background-color: var(--asc${a}a );`;
            }
        }
        return;
    }
    let d = document.getElementById(`d${t}`).children[0];
    for( let i = 0; i < 6; i++ ){
        d.children[i].classList = `${ord[i]} f${game.dice[t].faces[i]} edit`
    }
}

function updateAscCosts(){
    let kill = document.querySelectorAll(`.ascCost`);
    for( let k = 0; k < kill.length; k++ ){ kill[k].parentElement.remove(kill[k]); }
    let a = document.querySelectorAll(`.dieOptions`);
    for( let i = 0; i < a.length; i++ ){
        while( a[i].children.length > 1 ){ a[i].removeChild( a[i].children[1] ); }
        let n = document.createElement(`div`);
        n.classList = `pipText`;
        n.innerHTML = `10x Multiplier`
        a[i].appendChild( n );
        n = document.createElement(`div`);
        n.classList = `pipCost`;
        n.innerHTML = `Cost: <div class="mpip"></div>x<div class="mpips">${numDisplay( getAscCost( i ) ) }</div>`
        a[i].appendChild( n );
        n = document.createElement(`div`);
        n.classList = `pipText`;
        n.innerHTML = `Current x10<sup>${game.dice[i].asc}</sup>`
        a[i].appendChild( n );
    }
}

function modPips( d, f, up ){
    if( d == null ){ return }
    if( up && game.pips < 1 ){ return }
    if( up && game.dice[d].faces[f] == 9 ){ return }
    if( !up && game.dice[d].faces[f] == 0 ){ return }
    // valid purchase
    if( up ){
        game.pips--;
        game.dice[d].faces[f]++;
        document.querySelectorAll(`.banner`)[0].innerHTML = ``;
    }
    else{
        game.pips++;
        game.dice[d].faces[f]--;
        document.querySelectorAll(`.banner`)[1].innerHTML = ``;
    }
    showUnfolded();
    updateFaces( d );
    updateHeader();
    showPpr();
}

function buyPip(){
    if( game.points < pipPrice() ){ return }
    game.points -= pipPrice();
    game.pips++;
    game.pipsBought++;
    updatePipCost();
    updateHeader();
}

function buyAllPips(){
    while( game.points >= pipPrice() ){        
        game.points -= pipPrice();
        game.pips++;
        game.pipsBought++;
    }
    updatePipCost();
    updateHeader();
}

function buyUpgrade( type ){
    if( game.points < upgradePrice( type ) ){ return }
    game.points -= upgradePrice( type );
    game.upgrades[type]++;
    updatePrices();
    updateHeader();
    showPpr();
    checkAchieve( `infinite`, `upgrade`, game.upgrades[type], type );
}

function buyAllUpgrades( type ){
    while( game.points >= upgradePrice( type ) ){
        game.points -= upgradePrice( type );
        game.upgrades[type]++;
        checkAchieve( `infinite`, `upgrade`, game.upgrades[type], type );
    }
    updatePrices();
    updateHeader();
    showPpr();
}

function ascendDie( d ){
    let p = getAscCost( d );
    let n = game.pips;
    if( n < p ){ return }
    let current = 0;
    for( e in game.dice ){
        for( f in game.dice[e].faces ){
            current += game.dice[e].faces[f];
        }
    }
    if( current + n <= 1 ){ return } // don't sell your last pip
    game.dice[d].asc++;
    game.pips -= p;
    updateFaces( `all` );
    showUnfolded( d );
    updateHeader();
    showPpr();
    updateAscCosts();
    checkAchieve( `infinite`, `ascension`, game.dice[d].asc );
    let min = Infinity;
    for( d in game.dice ){ if( game.dice[d].asc < min ){ min = game.dice[d].asc; } }
    checkAchieve( `infinite`, `minAscension`, min );
}

function getAscCost( d ){
    return game.baseAscCost + game.dice[d].asc;
}

function upgradePrice( type ){
    return game.baseUpgradeCost * multiplier[type] * Math.pow( ( 1 + ( game.pipPricePower - 1 ) * getPerk( `upgPower` ) ), game.upgrades[type] );
}

function conditionalShow(){
    if( game.prestige.watermark > 0 ){ document.getElementById(`spendPP`).classList.remove(`noDisplay`); }
}

const multNames = [ 
    { id: `five`, name: `Five of a kind` }
    , { id: `four`, name: `Four of a kind` }
    , { id: `three`, name: `Three of a kind` }
    , { id: `two`, name: `Two of a kind` }
    , { id: `twoPair`, name: `Two pair` }
    , { id: `fullHouse`, name: `Full house` }
    , { id: `straight`, name: `Straight` }
]

function buildUpgradeMenu(){
    let t = document.getElementById(`upgrades`);
    t.innerHTML = `<div class="bundle noDisplay" id="spendPP">
        <div class="button spendPP">Spend PP</div><div class="append">Gain powerful perks</div></div>
    <div class="heading">Multipliers</div>`;
    for( let i = 0; i < multNames.length; i++ ){
        let x = multNames[i].id;
        let v = document.createElement(`div`);
        v.classList = `bundle vert`;
        v.innerHTML = `<div class="label">${multNames[i].name}</div><div class="mlabel">x<a data-multi="${x}">0</a> Multiplier<a class="math" data-multiMath="${x}"></a></div>`;
        t.appendChild(v);
        let b = document.createElement(`div`);
        b.classList = `bundle`;
        b.setAttribute(`data-ref`, x );
        b.innerHTML = `<div class="button upgrade" data-ref="${x}">Upgrade</div><div class="append">Cost: <a data-multiCost="${x}">N</a> points</div>`;
        t.appendChild(b);
    }
}

function updateHeader(){
    let h = document.getElementById(`header`);
    let pp = `<div>`;
    if( game.prestige.watermark >= 1 ){ pp += `pp = ${numDisplay( game.prestige.curr )} ( best = ${numDisplay(game.prestige.watermark)} )` }
    pp += `</div>`
    h.innerHTML = `<div class="third">${pp}</div><div class="third cThird"><div class="pip"></div> x <div class="pips">${numDisplay( game.pips )}</div></div><div class="third rThird">points = <div class="pips">${numDisplay( game.points )}</div></div>`
    checkDisable();
}

function checkDisable(){
    let t = document.querySelector(`.buyPip`);
    if( game.points < pipPrice() ){ t.classList.add(`disabled`); }
    else{ t.classList.remove(`disabled`); }
    t = document.querySelectorAll(`.upgrade`);
    for( let i = 0; i < t.length; i++ ){
        if( game.points < upgradePrice( t[i].getAttribute(`data-ref`) ) ){ t[i].classList.add(`disabled`); }
        else{ t[i].classList.remove(`disabled`); }
    }
    t = document.querySelectorAll(`.ascend`);
    let float = 0;
    for( let i = 0; i < t.length; i++ ){
        for( let j = 0; j < 6; j++ ){
            float += game.dice[i].faces[j];
        }
    }
    for( let i = 0; i < t.length; i++ ){
        let cost = getAscCost( t[i].getAttribute(`data-ascref`) );
        if( game.pips < cost ){ t[i].classList.add(`disabled`); }
        else if( cost == game.pips + float ){ t[i].classList.add(`disabled`); }
        else{ t[i].classList.remove(`disabled`); }
    }
    t = document.querySelectorAll(`.buyPerk`);
    for( let i = 0; i < t.length; i++ ){
        let r = t[i].getAttribute(`data-ref`);
        if( game.prestige.curr < perkPrice( r ) ){ t[i].classList.add(`disabled`); }
        else{ t[i].classList.remove(`disabled`); }
    }
    let pp = false;
    let pk = Object.keys( game.prestige.perks );
    for( let p = 0; p < pk.length; p++ ){
        if( game.prestige.curr >= perkPrice( pk[p] ) ){ pp = true; }
    }
    if( pp ){ document.querySelector(`.spendPP`).classList.remove(`disabled`); }
    else{ document.querySelector(`.spendPP`).classList.add(`disabled`); }
    showPrestige();
}
function showPrestige(){
    if( game.points < 1e6 ){
        document.getElementById(`prestige`).classList.add(`noDisplay`);
        document.getElementById(`goalBar`).classList.remove(`noDisplay`);
        let t = document.getElementById(`goalBar`);
        t.children[0].style.width = 100 - ( game.points / 1e6 * 100 ) + `%`;
        t.children[1].innerHTML = `${numDisplay( game.points )} / ${numDisplay( 1e6 )}`
        return
    }
    document.getElementById(`prestige`).classList.remove(`noDisplay`);
    document.getElementById(`goalBar`).classList.add(`noDisplay`);
    let pg = prestigeGains();
    if( pg == Infinity ){ pg = 0; }
    let delta = Math.max( 0, pg - game.prestige.watermark );
    let suff = ``;
    if( delta > 0 ){ suff = ` and +${ numDisplay( delta ) }x to all rolls`.replace(` +1x`, ` 1x ( no benefit )` ).replace( ` +`, game.prestige.watermark == 0 ? ` ` : ` +`); }
    document.getElementById(`prestige`).innerHTML = `<div class="button prestige">Prestige</div> to receive ${numDisplay( pg ) } PP${suff}`;
}
function updateFooter(){
    // let h = document.getElementById(`footer`);
    // h.innerHTML = `points = <div class="pips">${numDisplay( game.points )}</div>`
}
function updatePipCost(){
    document.getElementById(`pipCost`).innerHTML = numDisplay( pipPrice() );
}
function updatePrices(){
    let a = document.querySelectorAll(`.upgrade`);
    let u = getPerk(`upgrades`);
    let r = getUpgradeRanks();
    for( let i = 0; i < a.length; i++ ){
        let q = a[i].getAttribute(`data-ref`);
        document.querySelector(`[data-multi=${q}]`).innerHTML = numDisplay( ( 1 + game.upgrades[q] ) * multiplier[q] * ( 1 + ( u * r ) / 100 ) );
        document.querySelector(`[data-multicost=${q}]`).innerHTML = numDisplay( upgradePrice( q ) );
        if( game.upgrades[q] !== 0 || game.prestige.watermark !== 0 ){
            if( u > 0 ){
                document.querySelector(`[data-multiMath=${q}]`).innerHTML = `( x${numDisplay( multiplier[q] )} x ${numDisplay( 1 + game.upgrades[q] )} x ${numDisplay( 100 + u * r )}% )`;
            }
            else{
                document.querySelector(`[data-multiMath=${q}]`).innerHTML = `( x${numDisplay( multiplier[q] )} x ${numDisplay( 1 + game.upgrades[q] )} )`;
            }
        }
    }
}

function pipPrice(){
    return Math.pow( ( 1 + ( game.pipPricePower - 1 ) * getPerk( `pipPower` ) ), game.pipsBought );
}

function prestigeGains(){
    let base = Math.max( 0, Math.floor( Math.pow( Math.log10( game.points / ( Math.pow( 10, game.prestige.floor ) ) ), 2 ) ) );
    let aMod = Math.pow( 1 - ( 0.01 ), ach.balance.infinite );
    return Math.round( base / aMod );
}

function perkPrice( p ){
    let pp = game.prestige.perks[p];
    return Math.pow( pp.cost, pp.amt + 1 );
}

function buyPerk( p ){
    if( game.prestige.curr < perkPrice( p ) ){ return }
    game.prestige.curr -= perkPrice( p );
    game.prestige.perks[p].amt++;
    if( p == `startPips` ){ game.pips++; }
    updateHeader();
    ppModal();
}

function prestige(){
    let p = prestigeGains();
    if( p == 0 ){ return }
    // gains
    game.prestige.count++;
    game.prestige.curr += p;
    game.prestige.watermark = Math.max( p, game.prestige.watermark );
    // reset state
    for( d in game.dice ){
        for( f in game.dice[d].faces ){
            game.dice[d].faces[f] = 0;
        }
        game.dice[d].asc = 0;
    }
    game.pips = 4 + getPerk( `startPips` );
    game.pipsBought = 0;
    game.points = 0;
    for( k in Object.keys( game.upgrades ) ){
        game.upgrades[Object.keys( game.upgrades )[k]] = 0;
    }
    game.volatile.lastRoll = null;
    // UI reset
    updateHeader();
    updatePipCost();
    updatePrices();
    updateFaces( `all` );
    showUnfolded();
    showPpr();
    conditionalShow();
    localStorage.setItem( `backup-game` , JSON.stringify( game ) );
    localStorage.setItem( `backup-ach` , JSON.stringify( ach ) );
}


var game = {
    dice: [
        { faces: [0,0,0,0,0,0], asc: 0 }
        , { faces: [0,0,0,0,0,0], asc: 0 }
        , { faces: [0,0,0,0,0,0], asc: 0 }
        , { faces: [0,0,0,0,0,0], asc: 0 }
        , { faces: [0,0,0,0,0,0], asc: 0 }
    ]
    , pips: 4
    , points: 0
    , pipsBought: 0
    , baseUpgradeCost: 1e2
    , ascMod: 10
    , baseAscCost: 5
    , pipPricePower: 2
    , upgrades: { five: 0, four: 0, three: 0, two: 0, twoPair: 0, fullHouse: 0, straight: 0 }
    , prestige: {
        count: 0
        , curr: 0
        , watermark: 0
        , perks: {
            startPips: { impact: 1, amt: 0, cost: 2, costScale: 2, type: `multiply`,    disp: `Head Start`, desc: `+1 Pip available after prestige`  }
            , upgPower: { impact: 0.85, amt: 0, cost: 5, costScale: 2, type: `power`,   disp: `Multiplier Cost`, desc: `Multiplier upgrade price creep reduced by 15%` }
            , pipPower: { impact: 0.8, amt: 0, cost: 10, costScale: 2, type: `power`,   disp: `Pip Price Power`, desc: `Pip price creep reduced by 20%` }
            , autoTime: { impact: 0.75, amt: 0, cost: 15, costScale: 2, type: `power`,  disp: `Speedy Roller`, desc: `Reduce time between rolls by 25%` }
            , square: { impact: 1, amt: 0, cost: 50, costScale: 2, type: `multiply`,    disp: `Adding Squared`, desc: `Dice values gain x<sup>+1 </sup> for additions` }
            , spares: { impact: 1, amt: 0, cost: 100, costScale: 2, type: `multiply`,   disp: `Spare PPower`, desc: `Results x floor( log10( unspent PP ) )` }
            , upgrades: { impact: 0.1, amt: 0, cost: 1e3, costScale: 2, type: `multiply`,   disp: `Every Bit Helps`, desc: `Multipliers get +0.1% for every upgrade bought` }
        }
        , floor: 5
    }
    , rolls: { auto: 0, manual: 1 }
    , combo: { five: 0, four: 0, three: 0, two: 0, twoPair: 0, fullHouse: 0, straight: 0 }
    , arrs: {}
    , baseTTNR: 10000 - 2000 - 350
    , volatile: {
        direction: true
        , ttnr: 5000
        , lastRoll: null
        , mouseDown: false
        , mouseCount: null
        , mouseTarget: null
    }
    , animationTime: 2000
    , settleTime: 350
    , tickTime: 25
}

function checkAchieve( group, type, value, subtype ){
    if( group == `infinite` ){
        // Can only be gained one at a time, no subtype
        if( type == `ascension` ){ if( value > ach.infinite.ascension ){ ach.infinite.ascension = value; gainAchievement( group, type ); } }
        else if( type == `minAscension` ){ if( value > ach.infinite.minAscension ){ ach.infinite.minAscension = value; gainAchievement( group, type ); } }
        // Can be gained multiple in on go, no subtype
        else if( type == `score` ){ 
            if( value >= Math.pow( 10, ach.infinite[type] ) ){
                let n = Math.floor( Math.log10( value ) ) - ach.infinite[type];
                ach.infinite[type] += n;
                while( n > 0 ){ gainAchievement( group, type ); n--; }
            }
        }
        // bail out if no subtype provided
        else if( subtype == undefined ){ console.log( `No subtype provided.` ); return }
        // Can only be gained one at a time, w/ subtype
        else if( type == `rolls` ){
            if( value >= Math.pow( 10, ach.infinite[type][subtype] ) ){
                ach.infinite[type][subtype]++;
                gainAchievement( group, type, subtype );
            }
        }
        // Can be gained multiple in on go, w/ subtype
        else{
            if( type == `combo` && value >= Math.pow( 10, ach.infinite[type][subtype] ) ){
                let n = Math.floor( Math.log10( value ) ) - ach.infinite[type][subtype];
                ach.infinite[type][subtype] += n;
                while( n > 0 ){ gainAchievement( group, type, subtype ); n--; }
            }
            else if( Math.floor( value / 50 ) >= ach.infinite[type][subtype] ){
                let n = Math.floor( value / 50 ) - ach.infinite[type][subtype];
                ach.infinite[type][subtype] += n;
                while( n > 0 ){ gainAchievement( group, type, subtype ); n--; }
            }
        }
    }
}

function checkFinite( m, arr ){
    for( let i = 0; i < arr.length; i++ ){
        if( !ach.finite[`r${arr[i]}`][m] ){
            ach.finite[`r${arr[i]}`][m] = true;
            gainAchievement( `finite`, `die value ${arr[i]}`, multNames.filter( o => { return o.id === m } )[0].name );
        }
    }
    showPpr();
}

function gainAchievement( group, type, subtype ){
    rebalanceAchievement();
    console.log( `Achievement: `, group, type, subtype );
}

function rebalanceAchievement(){
    let inf = 0;
    for( i in ach.infinite ){
        if( Object.keys( ach.infinite[i] ).length > 0 ){
            for( j in ach.infinite[i] ){
                inf += ach.infinite[i][j];
            }
        }
        else{ inf += ach.infinite[i]; }
    }
    ach.balance.infinite = inf;
    let fin = 0;
    for( f in ach.finite ){
        for( c in ach.finite[f] ){
            if( ach.finite[f][c] ){ fin++; }
        }
    }
    ach.balance.finite = fin;
}

var ach = {
    infinite: {
        ascension: 0, minAscension: 0, score: 0,
        rolls: { auto: 0, manual: 0 },
        upgrade: { five: 0, four: 0, three: 0, two: 0, twoPair: 0, fullHouse: 0, straight: 0 },
        combo: { five: 0, four: 0, three: 0, two: 0, twoPair: 0, fullHouse: 0, straight: 0 },
    }
    , finite: {
        r1: { five: false, four: false, three: false, two: false, straight: false, twoPair: false, fullHouse: false },
        r2: { five: false, four: false, three: false, two: false, straight: false, twoPair: false, fullHouse: false },
        r3: { five: false, four: false, three: false, two: false, straight: false, twoPair: false, fullHouse: false },
        r4: { five: false, four: false, three: false, two: false, straight: false, twoPair: false, fullHouse: false },
        r5: { five: false, four: false, three: false, two: false, straight: false, twoPair: false, fullHouse: false },
        r6: { five: false, four: false, three: false, two: false, straight: false, twoPair: false, fullHouse: false },
        r7: { five: false, four: false, three: false, two: false, straight: false, twoPair: false, fullHouse: false },
        r8: { five: false, four: false, three: false, two: false, straight: false, twoPair: false, fullHouse: false },
        r9: { five: false, four: false, three: false, two: false, straight: false, twoPair: false, fullHouse: false },
    }
    , hidden: {}
    , balance: { infinite: 0, finite: 0, hidden: 0 }
}

let aDictionary = {
    ascension: { name: `Ascension`, desc: `Ascend a die to rank #`, comp: `Ascended a die to rank # for the first time!` },
    minAscension: { name: `Ascend-All`, desc: `Ascend all dice to rank #`, comp: `Ascended all dice to rank # for the first time!` },
    score: { name: `High Score`, desc: `Reach a score of 10 to the power of #`, comp: `Reachd a score of 10 x <sup>#</sup> for the first time!` },
    rollsAuto: { name: `Auto Roller`, desc: `Let the dice roll # times automatically`, comp: `# automatic rolls!` },
    rollsManual: { name: `Hands On`, desc: `Roll the dice # times manually`, comp: `# manual rolls!` },
    upgrade: { name: `Upgrade ?`, desc: `Upgrade ? Multiplier # times`, comp: `? upgraded # times!` },
    combo: { name: `Roll a ?`, desc: `Rolled ? # times`, comp: `? rolled # times!` },
    // Upgrades

    // SECRETS (that were a pain in the butt to hide, so please stop trying to spoil the surprise)
    sixtyNine: { name: `TmljZSwgbG9s`, desc: ``, comp: `SGFkIGEgdG90YWwgc2NvcmUgb2YgNjkgbG9sb2xvbCE=`}, // Score of 69
    fullestHouse: { name: `RnVsbGVzdCBIb3VzZQ==`, desc: ``, comp: `RG9lc24ndCBnZXQgYmV0dGVyIHRoYW4gbmluZXMgb3ZlciBlaWdodHMh` }, // Full house, 9s over 8s
    orderlyStraight: { name: `T3JkZXJseSBTdHJhaWdodA==`, desc: ``, comp: `VGhhdCBpcyBvbmUgc3RyYWlnaHQgbG9va2luZyBzdHJhaWdodCE=` }, // 1, 2, 3, 4, 5
    whatAreTheOdds: { name: `V2hhdCBhcmUgdGhlIG9kZHM/`, desc: ``, comp: `WWFodHplZSB3aXRoIDI1IGJsYW5rIGZhY2VzIC4uLiBvbmUgaW4gNyw3NzYh` }, // 5 of a kind, 25 blank faces
    fiveNines: { name: `TWF4ZWQgT3V0`, desc: ``, comp: `Rml2ZSBuaW5lcyBpcyBubyBzbWFsbCBmZWF0IQ==` }, // 9 on every dice
    unholyStraight: { name: `VW5ob2x5IFN0cmFpZ2h0`, desc: ``, comp: `WW91IGNvdWxkbid0IGdldCBoYWxmIG9mIHRoYXQgc3RyYWlnaHQgb24gcmVndWxhciBkaWNlIQ==` }, // 5, 6, 7, 8, 9 (any order)
    luckySevens: { name: `Qmxlc3NlZA==`, desc: ``, comp: `Li4uIHdpdGggbHVja3kgc2V2ZW5zLCBhbmQgdGhlIHZvaWNlIHRoYXQgbWFkZSBtZSBjcnkh` }, // 7 on every dice, all faces sevens or blank
    // All your pips in one basket (nines on every face of one die, blanks for everything else)
    // Prestige without ascending
}

function getPerk( p ){
    if( game.prestige.perks[p].type == `multiply` ){ return game.prestige.perks[p].impact * game.prestige.perks[p].amt; }
    else if( game.prestige.perks[p].type == `power` ){ return Math.pow( game.prestige.perks[p].impact, game.prestige.perks[p].amt ); }
    
}

function parseMultiplier( arr ){
    let u = getPerk(`upgrades`);
    let mod = 1;
    if( u > 0 ){ mod += getPerk(`upgrades`) * getUpgradeRanks() / 100; }
    let multi = ``;
    arr = arr.filter( x => x !== 0 );
    const a = {}
    for( let i = 0; i < 10; i++ ){ a[i] = 0; }
    for( i in arr ){ a[arr[i]]++; }
    for( let i = 0; i < 10; i++ ){
        if( i < 6 ){
            if( a[i] == 1 && a[i+1] == 1 && a[i+2] == 1 && a[i+3] == 1 && a[i+4] == 1 ){ multi = `straight`; return [ multiplier[multi] * ( 1 + game.upgrades[multi] ) * mod, multi, arr ]; }
        }
    }
    for( let i = 0; i < 10; i++ ){
        if( a[i] == 5 ){ multi = `five`; return [ multiplier[multi] * ( 1 + game.upgrades[multi] ) * mod, multi, [i] ]; }
    }
    for( let i = 0; i < 10; i++ ){
        if( a[i] == 4 ){ multi = `four`; return [ multiplier[multi] * ( 1 + game.upgrades[multi] ) * mod, multi, [i] ]; }
    }
    for( let i = 0; i < 10; i++ ){
        if( a[i] == 3 ){
            for( let j = 0; j < 10; j++ ){
                if( a[j] == 2 ){ multi = `fullHouse`; return [ multiplier[multi] * ( 1 + game.upgrades[multi] ) * mod, multi, [i,j] ]; }
            }
            multi = `three`; return [ multiplier[multi] * ( 1 + game.upgrades[multi] ) * mod, multi, [i] ];
        }
    }
    for( let i = 0; i < 10; i++ ){
        if( a[i] == 2 ){
            for( let j = 0; j < 10; j++ ){
                if( i == j ){}
                else if( a[j] == 2 ){ multi = `twoPair`; return [ multiplier[multi] * ( 1 + game.upgrades[multi] ) * mod, multi, [i,j] ]; }
            }
            multi = `two`; return [ multiplier[multi] * ( 1 + game.upgrades[multi] ) * mod, multi, [i] ];
        }
    }
    return [ 1, multi, [] ];
}

function getUpgradeRanks(){
    let o = 0;
    for( u in game.upgrades ){ o += game.upgrades[u] }
    return o;
}

const ord = [`top`,`left`,`front`,`right`,`bottom`,`back`];
const multiplier = { five: 50, four: 40, three: 25, two: 5, twoPair: 25, fullHouse: 75, straight: 250 };


function spinAll(){
    let n = game.dice.length;
    let res = [];
    for( let i = 0; i < n; i++ ){ res.push( spin( i ) ); }
    setTimeout(() => {
        document.getElementById(`bounceMe`).style = `animation: ${getAnimationTime( false ) / 2}ms ease-out 0s 2 alternate none running bounce;`;
    }, 1 );
    setTimeout(() => { 
        document.getElementById(`bounceMe`).style = `animation: ${getAnimationTime( null ) / 2}ms ease-out 0s 2 alternate none running sBounce;`;
    } , getAnimationTime( false ) );
    setTimeout(() => { resolveRoll( res ); }, getAnimationTime( false ) );
    game.volatile.ttnr = ( game.baseTTNR * getPerk( `autoTime` ) ) + getAnimationTime( true );
}

function getAnimationTime( both ){
    let mod = 1 - ( 0.005 * ach.balance.finite );
    if( both == null ){
        return Math.floor( game.settleTime * mod )
    }
    else if( both ){
        return Math.floor( ( game.animationTime + game.settleTime ) * mod )
    }
    else{
        return Math.floor( game.animationTime * mod )
    }
}

function resolveRoll( res ){
    let o = 1;
    let p = 0;
    let a = [];
    let b = 0;
    let str = `r`;
    for( r in res ){
        let f = game.dice[res[r].die].faces[res[r].face];
        str += f;
        a.push( f );
        if( f !== 0 ){
            b += game.dice[r].asc;
            o *= f;
            p += Math.pow( f, 1 + getPerk(`square`) );
        }
    }
    if( game.arrs[str] == undefined ){ game.arrs[str] = true; }
    if( p == 0 ){ o = 0; }
    let m = parseMultiplier( a )[0];
    game.combo[parseMultiplier( a )[1]]++;
    let aa = parseMultiplier( a );
    checkAchieve( `infinite`, `combo`, game.combo[aa[1]], aa[1] );
    checkFinite( aa[1], aa[2] )
    let pres = Math.max( 1, game.prestige.watermark );
    let ppp = Math.max( 1, Math.floor( Math.log10( game.prestige.curr ) + 1 ) * getPerk(`spares`) );
    if( isNaN( ppp ) ){ ppp = 0; }
    game.points += p * o * m * Math.pow( 10, b ) * ( pres * Math.max( 1, ppp ) );
    game.volatile.lastRoll = now();
    updateHeader();
    postResults( p, o, m, b, pres, ppp );
    checkAchieve( `infinite`, `score`, game.points );
    saveState();
}

function postResults( p, o, m, b, pres, ppp ){
    let t = document.getElementById(`results`);
    if( t.children.length > 0 ){ t.lastChild.remove(); }
    while( t.children.length > 9 ){ t.firstChild.remove(); }
    let n = document.createElement(`div`);
    n.classList = `resultRow`;
    n.innerHTML = ``;
    if( game.prestige.watermark > 0 ){ n.innerHTML += `${numDisplay( pres )}x `}
    n.innerHTML += `( ${ numDisplay( p ) } ) x [ ${ numDisplay( o ) } ] x { ${ numDisplay( m ) } } x 10<sup>${ numDisplay( b )}</sup>${ ppp > 0 ? ' x ' + numDisplay( ppp ) : '' } = <a class="emph">${ numDisplay( p * o * m * pres * Math.pow( 10, b ) ) }</a>`;
    t.appendChild( n );
    let h = document.createElement(`div`);
    h.classList = `rHeading`;
    h.innerHTML = `Results`;
    t.appendChild( h );
}

function catchUp(){
    let n = now();
    if( game.volatile.lastRoll == null ){ return }
    if( n - game.volatile.lastRoll > ( game.volatile.ttnr + getAnimationTime( true ) ) * 2 ){
        let mins = Math.floor( ( n - game.volatile.lastRoll ) / 60000 );
        let p = ppr().ppr * mins * 60000 / ( ( game.baseTTNR * getPerk( `autoTime` ) ) + getAnimationTime( true ) );
        console.log( `Last seen at ${game.volatile.lastRoll}. Offline for ${numDisplay( mins )} minutes. ${numDisplay( p )} points gained while offline.`);
        game.points += p;
        n = document.createElement(`div`);
        n.classList = `resultRow`;
        n.innerHTML = `${numDisplay( mins )} Minutes Offline = <a class="emph">${ numDisplay( p ) }</a>`
        let r = document.getElementById(`results`);
        if( r.children.length > 0 ){ r.lastChild.remove(); }
        let h = document.createElement(`div`);
        h.classList = `rHeading`;
        h.innerHTML = `Results`;
        r.appendChild( n );
        r.appendChild( h );
        updateHeader();
        while( r.children.length > 9 ){ r.firstChild.remove(); }
    }
}

let rotate = [ { x: 3, y: 2 }, { x: 2, y: 3 }, { x: 2, y: 2 }, { x: 2, y: 1 }, { x: 1, y: 3 }, { x: 0, y: 2 } ];
function spin( d ){
    let newFace = Math.floor( Math.random() * 6 );
    let xFace = ( 90 * rotate[newFace].x );
    let yFace = ( 90 * rotate[newFace].y );
    let dir = game.volatile.direction ? 1 : -1;
    document.getElementById(`d${d}`).children[0].style = `transform: rotateX(${ xFace + 360 * dir }deg) rotateY(${ yFace + 360 * dir }deg); transition: transform ${getAnimationTime( false )}ms linear;`;
    game.volatile.direction =  !game.volatile.direction;
    return { die: d, face: newFace };
}

function manualSpin(){
    if( game.volatile.ttnr > ( game.baseTTNR * getPerk( `autoTime` ) ) ){ return }
    else{ spinAll(); game.rolls.manual++; checkAchieve( `infinite`, `rolls`, game.rolls.manual, `manual` ); }
}

function showPpr(){
    let o = ppr();
    document.querySelector(`[data-ref="ppm"]`).innerHTML = numDisplay( o.ppr * 60000 / ( ( game.baseTTNR * getPerk( `autoTime` ) ) + getAnimationTime( true ) ) );
    document.querySelector(`[data-ref="min"]`).innerHTML = numDisplay( o.min );
    document.querySelector(`[data-ref="max"]`).innerHTML = numDisplay( o.max );
}

function ppr(){
    let score = 0;
    let max = 0;
    let min = Infinity;
    for( let a = 0; a < 6; a++ ){
        for( let b = 0; b < 6; b++ ){
            for( let c = 0; c < 6; c++ ){
                for( let d = 0; d < 6; d++ ){
                    for( let e = 0; e < 6; e++ ){
                        let aa = game.dice[0].faces[a];
                        let bb = game.dice[1].faces[b];
                        let cc = game.dice[2].faces[c];
                        let dd = game.dice[3].faces[d];
                        let ee = game.dice[4].faces[e];
                        let m = parseMultiplier( [aa,bb,cc,dd,ee] )[0];
                        let o = 1;
                        if( aa !== 0 ){ o *= aa * Math.pow( game.ascMod, game.dice[0].asc ); }
                        if( bb !== 0 ){ o *= bb * Math.pow( game.ascMod, game.dice[1].asc ); }
                        if( cc !== 0 ){ o *= cc * Math.pow( game.ascMod, game.dice[2].asc ); }
                        if( dd !== 0 ){ o *= dd * Math.pow( game.ascMod, game.dice[3].asc ); }
                        if( ee !== 0 ){ o *= ee * Math.pow( game.ascMod, game.dice[4].asc ); }
                        let pres = Math.max( 1, game.prestige.watermark );
                        let result = ( sq(aa) + sq(bb) + sq(cc) + sq(dd) + sq(ee) ) * o * m * pres ;
                        score += result;
                        if( result < min ){ min = result; }
                        if( result > max ){ max = result; }
                    }
                }
            }
        }
    }
    return { cumTotal: score, ppr: Math.floor( score / 7776 ), min: min, max: max }
}

function sq( n ){
    return Math.pow( n, getPerk( `square` ) + 1 );
}


function showModal(){
    document.querySelector(`.modal`).classList.toggle(`noDisplay`);
}

function ppModal(){
    document.querySelector(`.modal`).classList.remove(`noDisplay`);
    let t = document.querySelector(`.modalContainer`);
    t.innerHTML = `<div class="close">x</div><div class="heading firstH">Perks</div>`;
    t.innerHTML += `<div class="perkRow"><div class="perkText" style="width: 20%;">Perk</div><div class="perkText" style="width: 55%;">Description</div><div class="perkText" style="width: 20%;">Cost</div><div style="width: 11.5rem;"></div></div>`
    let perks = Object.keys( game.prestige.perks );
    for( p in perks ){
        let r = document.createElement(`div`);
        r.classList = `perkRow`;
        let x = document.createElement(`div`);
        x.classList = `perkText`;
        x.style.width = `20%`;
        x.innerHTML = game.prestige.perks[perks[p]].disp;
        r.appendChild(x);
        x = document.createElement(`div`);
        x.classList = `perkText`;
        x.innerHTML = game.prestige.perks[perks[p]].desc;
        x.style.width = `55%`;
        r.appendChild(x);
        x = document.createElement(`div`);
        x.classList = `perkText`;
        x.innerHTML = `<div class="pp">pp</div> x <div class="pips">${numDisplay( perkPrice( perks[p] ) )}</div>`;
        x.style.width = `20%`;
        r.appendChild(x);
        x = document.createElement(`div`);
        x.classList = `buyPerk button`;
        x.setAttribute( `data-ref`, perks[p] );
        x.style.width = `20%`;
        x.innerHTML = `Buy`;
        r.appendChild(x);
        t.appendChild(r);
    }
    checkDisable();
}

function infoModal(){
    document.querySelector(`.modal`).classList.remove(`noDisplay`);
    let t = document.querySelector(`.modalContainer`);
    t.innerHTML = `<div class="close">x</div>
    <div class="heading firstH">General Information</div>
    <div class="deets"><b>Controls</b></div>
    <div class="deets">You can "rapid-press" any button by just clicking it and holding down the mouse button</div>
    <div class="deets">Buttons for buying Upgrades and Pips will allow your to "buy max" by right-clicking on them</div>
    <div class="deets"></div>
    <div class="bundle">
    <div class="key"><b>Key</b></div>
    <div class="descriptor"><b>Bound To</b></div>
    </div>
    <div class="bundle">
    <div class="key">[Space]</div>
    <div class="descriptor">Roll the dice</div>
    </div>
    <div class="bundle">
    <div class="key">p</div>
    <div class="descriptor">Buy one pip</div>
    </div>
    <div class="bundle">
    <div class="key">1 - 5</div>
    <div class="descriptor">Ascend the corresponding die once</div>
    </div>
    <div class="deets"></div>
    <div class="deets"><b>Tips & General Advice</b></div>
    <div class="deets">Achievements matter!</div>
    <div class="deets ind">The ones marked <i>Finite</i> speed up the animation time of the dice rolling</div>
    <div class="deets ind">The ones marked <i>Infinite</i> may be achieved again and again, and keep adding bonuses when gained</div>
    <div class="deets ind">The ones marked <i>Hidden</i> probably aren't even implemented yet, I wouldn't worry about them</div>
    <div class="deets">After your first Prestige at one million points (or more), you will be able to purchase Perks (the first costs 2PP)</div>
    <div class="deets">The cost of Perks does <u>not</u> reflect their relative value - Choose wisely based on your play stye</div>
    <div class="deets">Depending on the stage of the game and Perks you have bought, the optimal strategy will change drastically</div>
    <div class="deets">Blank-face dice are completely ignored for the purposes of calculating score (including their ascension level!)</div>
    <div class="deets">The Results rows can be a bit confusing - you'll figure it out ... only the final number matters anyway ;)</div>
    <div class="deets"></div>
    <div class="deets"><b>Stuck?</b></div>
    <div class="generalText"><a>Perform a </a><div class="button softReset">Soft Reset</div><a> to reset to your last Prestige, or if you want to clear everything, perform a </a><div class="button hardReset">Hard Reset</div></div>
    `;
}

function achieveModal(){
    document.querySelector(`.modal`).classList.remove(`noDisplay`);
    let t = document.querySelector(`.modalContainer`);
    t.innerHTML = `<div class="close">x</div>
    <div class="heading firstH">Finite Achievements</div>
    <div class="deets">Each Multiplier combo below achieved with the face value shown speeds up the animation time by 0.5% (static), currently -${numDisplay( ( 0.5 * ach.balance.finite ) )}%</div>
    <div class="achTable">
        <div class="hRow">
            <div class="hCol"><div class="space"></div>Combo</div>
            <div class="dCol f1 padMe"></div>
            <div class="dCol f2 padMe"></div>
            <div class="dCol f3 padMe"></div>
            <div class="dCol f4 padMe"></div>
            <div class="dCol f5 padMe"></div>
            <div class="dCol f6 padMe"></div>
            <div class="dCol f7 padMe"></div>
            <div class="dCol f8 padMe"></div>
            <div class="dCol f9 padMe"></div>
        </div>
    </div>
    <div class="heading">Infinite Achievements</div>
    <div class="deets">Every rank of each achievement below improves your Prestige Points (PP) rewards by 1% (diminishing), currently +${numDisplay( ( 1 - Math.pow( 1 - ( 0.01 ), ach.balance.infinite ) ) * 100 )}%</div>
    <div class="achContainer"></div>
    <div class="heading">Hidden Achievements</div>
    <div class="deets">...shh</div>
    `;
    buildInfiniteTable();
    buildFiniteTable();
}

function buildFiniteTable(){
    let t = document.querySelector(`.achTable`);
    let i = 0;
    for( m in multNames ){
        let row = document.createElement(`div`);
        row.classList = `xRow ${i % 2 == 0 ? "shade" : ""}`;
        row.innerHTML = `<div class="hRow"><div class="space"></div>${multNames[m].name}</div>`;
        for( let d = 1; d < 10; d++ ){
            let col = document.createElement(`div`);
            col.classList = `dCol`;
            let val = `<a style="color: var(--g3)">No</a>`;
            if( ach.finite[`r${d}`][multNames[m].id] ){ val = `<a style="color: var(--g1)">Yes</a>`; }
            col.innerHTML = val;
            row.appendChild( col );
        }
        t.appendChild( row );
        i++;
    }
}

function buildInfiniteTable(){
    let t = document.querySelector(`.achContainer`);
    for( a in ach.infinite ){
        if( Object.keys( ach.infinite[a] ).length == 0 ){
            let row = document.createElement(`div`);
            row.classList = `infRow`;
            row.innerHTML = `<div class="infTitle">${aDictionary[a].name}</div>
            <div class="infComplete">${numDisplay( ach.infinite[a] )}</div>
            <div class="infBar shade">
                <div class="infProgress" style="width: ${ a == 'score' ? game.points / Math.pow( 10, ach.infinite[a] + 1 ) * 100 : ach.infinite[a] / ( ach.infinite[a] + 1 ) * 100 }%;"></div>
                <div class="infOverlay">${aDictionary[a].desc.replace( `#`, numDisplay( ach.infinite[a] + 1 ) )}</div>
            </div>
            `;
            t.appendChild(row);
        }
        else if( Object.keys( ach.infinite[a] ).length == 2 ){
            let row = document.createElement(`div`);
            row.classList = `infRow`;
            row.innerHTML = `<div class="infTitle">${aDictionary[`rollsAuto`].name}</div>
            <div class="infComplete">${numDisplay( ach.infinite[a].auto )}</div>
            <div class="infBar shade">
                <div class="infProgress" style="width: ${ game.rolls.auto / Math.pow( 10, ach.infinite.rolls.auto ) * 100 }%;"></div>
                <div class="infOverlay">${aDictionary[`rollsAuto`].desc.replace(`#`,numDisplay( Math.pow( 10, ach.infinite.rolls.auto ) ) )}</div>
            </div>`;
            t.appendChild(row);
            row = document.createElement(`div`);
            row.classList = `infRow`;
            row.innerHTML = `<div class="infTitle">${aDictionary[`rollsManual`].name}</div>
            <div class="infComplete">${numDisplay( ach.infinite[a].manual )}</div>
            <div class="infBar shade">
                <div class="infProgress" style="width: ${ game.rolls.manual / Math.pow( 10, ach.infinite.rolls.manual ) * 100 }%;"></div>
                <div class="infOverlay">${aDictionary[`rollsManual`].desc.replace(`#`,numDisplay( Math.pow( 10, ach.infinite.rolls.manual ) ) )}</div>
            </div>`;
            t.appendChild(row);
        }
        else{
            for( m in ach.infinite[a] ){
                let row = document.createElement(`div`);
                let target = ( ach.infinite[a][m] + 1 ) * 50;
                if( a == `combo` ){ target = ( Math.pow( 10, ach.infinite[a][m] + 1 ) ); }
                row.classList = `infRow`;
                row.innerHTML = `<div class="infTitle">${aDictionary[a].name.replace(`?`, multNames.filter( o => { return o.id === m } )[0].name ) }</div>
                <div class="infComplete">${numDisplay( ach.infinite[a][m] )}</div>
                <div class="infBar shade">
                    <div class="infProgress" style="width: ${ ( a == `combo` ? game.combo[m] : game.upgrades[m] ) / target * 100 }%;"></div>
                    <div class="infOverlay">${aDictionary[a].desc.replace(`?`, multNames.filter( o => { return o.id === m } )[0].name ).replace( `#`, numDisplay( target ) ) }</div>
                </div>
                `;
                t.appendChild(row);
            }
        }
    }
}

function numDisplay( x ){
    x = Math.floor( x );
    if( x >= 1e7 ){ return sciNum( x, 3 ); }
    else{ return x.toLocaleString(`en-US`); }
}

function sciNum( x, p ){
    let n = Math.floor( Math.log10( x ) );
    let m = ( x / Math.pow( 10, n ) ).toFixed( p );
    return `${m} × 10<sup>${ n }</sup>`;
}

function now(){
    return parseInt( ( new Date().getTime() ).toFixed( 0 ) );
}



function saveState(){
    localStorage.setItem( `game` , JSON.stringify( game ) );
    localStorage.setItem( `ach` , JSON.stringify( ach ) );
}

function hardReset(){
    localStorage.clear();
    location.reload();
}

function softReset(){
    localStorage.setItem( `game`, localStorage.getItem( `backup-game` ) );
    localStorage.setItem( `ach`, localStorage.getItem( `backup-ach` ) );
    location.reload();
}

function loadGame(){
    if( JSON.parse( localStorage.getItem( `game` ) ) == null ){ return }
    let g = JSON.parse( localStorage.getItem( `game` ) );
    game.points = g.points;
    game.pips = g.pips;
    game.pipsBought = g.pipsBought;
    for( d in game.dice ){
        for( f in game.dice[d].faces ){ game.dice[d].faces[f] = g.dice[d].faces[f];}
        game.dice[d].asc = g.dice[d].asc;
    }
    for( u in Object.keys( game.upgrades ) ){ game.upgrades[Object.keys( game.upgrades )[u]] = g.upgrades[Object.keys( game.upgrades )[u]]; }
    game.combo = g.combo;
    game.rolls = g.rolls;
    game.arrs = g.arrs;
    game.prestige.count = g.prestige.count;
    game.prestige.curr = g.prestige.curr;
    game.prestige.watermark = g.prestige.watermark;
    for( p in game.prestige.perks ){
        if( g.prestige.perks[p] !== undefined ){
            game.prestige.perks[p].amt = g.prestige.perks[p].amt;
        }
    }
    if( JSON.parse( localStorage.getItem( `ach` ) ) == null ){ return }
    let a = JSON.parse( localStorage.getItem( `ach` ) );
    for( i in a.infinite ){
        if( Object.keys( a.infinite[i] ).length > 0 ){
            for( j in a.infinite[i] ){
                ach.infinite[i][j] = a.infinite[i][j];
            }
        }
        else{ ach.infinite[i] = a.infinite[i]; };
    }
    ach.finite = a.finite;
    rebalanceAchievement();
}

setInterval(() => { tickDown() }, game.tickTime );

/*
TODO

Toasties 

IDEAS
Term limited dice power-ups (animated scrolling rainbow color faces, get some bonus to rolls of that dice)

Zen Mode (hide all UI elements other than the dice until next clicked on)

Loadout (Save and Restore)
- Destroy on Prestige
- Destroy on Ascend

** On achievement of all 63 FINITE achievements, unlock a Completionist bank of achievements to chase (every possible combo of dice and their values ? Start with all rolled arrays already marked off ...)

Ante pips (even number only) for a chance to gain or lose 50% of them - chance is straight 50/50

Prestige Perks
- Unspent, Unplaced Pips help somehow ?

~ Lucky Face ? Add to one dice to Nx the result when that face lands ?

*/