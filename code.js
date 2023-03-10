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
    refreshLockedUI();
    game.volatile.ttnr = ( game.baseTTNR * getPerk( `autoTime` ) ) + getAnimationTime( true );
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
    else if( c.contains(`hidden`) ){ hiddenModal(); }
    else if( c.contains(`ascendAuto`) ){ toggleAutoAscend( t.getAttribute(`data-ref`) ); }
    else if( c.contains(`buyPipAuto`) ){ toggleAutoPips(); }
    else if( c.contains(`upgradeAuto`) ){ toggleAutoUpgrade( t.getAttribute(`data-ref`) ); }
    else if( c.contains(`prestigeAuto`) ){ toggleAutoPrestige(); }
    else if( c.contains(`setLoadout`) ){ setLoadout( t.getAttribute(`data-ref`) ); }
    else if( c.contains(`unchecked`) ){ applyLoadout( t.getAttribute(`data-ref`) ); }
    else if( c.contains(`checked`) ){ unApplyLoadout( t.getAttribute(`data-ref`) ); }
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
    if( !game.volatile.pause ){
        game.volatile.ttnr -= game.tickTime;
        document.querySelector(`.autoTick`).style.width = `${Math.min( 1, game.volatile.ttnr / ( ( game.baseTTNR * getPerk( `autoTime` ) ) ) ) * 100 + "%"}`;
    }
    if( game.volatile.ttnr <= 0 ){ spinAll(); game.rolls.auto++; checkAchieve( `infinite`, `rolls`, game.rolls.auto, `auto` ); }
    if( game.volatile.mouseDown ){
        if( game.volatile.mouseCount < 10 ){ game.volatile.mouseCount++; }
        else{ clicked( game.volatile.mouseTarget ); }
    }
    if( game.volatile.updatePpr ){ showPpr(); game.volatile.updatePpr = false; }
    if( game.volatile.updateHeader ){ updateHeader(); game.volatile.updateHeader = false; }
    if( game.volatile.updateUpgrades ){ updatePrices(); game.volatile.updateUpgrades = false; }
    if( game.volatile.updateLockedUI ){ refreshLockedUI(); game.volatile.updateLockedUI = false; }
}

function pressed( e ){
    if( e.key == ` ` ){ manualSpin(); }
    else if( e.key == `1` ){ ascendDie( 0 ); }
    else if( e.key == `2` ){ ascendDie( 1 ); }
    else if( e.key == `3` ){ ascendDie( 2 ); }
    else if( e.key == `4` ){ ascendDie( 3 ); }
    else if( e.key == `5` ){ ascendDie( 4 ); }
    else if( e.key == `p` ){ buyPip(); }
    else if( e.key == `z` ){ zen(); }
    else if( e.key == `Escape` ){ pause(); }
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
                    c.innerHTML = `<div class="face modDice f${game.dice[i].faces[f]}"></div>`
                    c.setAttribute( `data-ref`, f );
                    c.setAttribute( `data-die`, i );
                    f++;
                }
                if( ach.hidden.modPips ){
                    if( ( ii == 2 && j == 0 && flip ) || ( ii == 0 && j == 0 && !flip ) ){
                        // set and show loadout
                        let p = document.createElement(`div`);
                        p.setAttribute(`data-ref`, i );
                        if( testLoadout( i ) ){ p.classList = `isLoadout`; }
                        else{ p.classList = `setLoadout`; }
                        if( flip ){ p.classList.add( `flip` ); }
                        c.appendChild( p );
                    }
                    else if( ( ii == 0 && j == 0 && flip ) || ( ii == 2 && j == 0 && !flip ) ){
                        // toggle on and off loadout
                        let p = document.createElement(`div`);
                        p.setAttribute(`data-ref`, i );
                        if( game.dice[i].autoLoadout ){ p.classList = `checked`; }
                        else{ p.classList = `unchecked`; }
                        if( flip ){ p.classList.add( `flip` ); }
                        c.appendChild( p );
                    }
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

function testLoadout( d ){
    let output = true;
    for( let i = 0; i < game.dice[d].faces.length; i++ ){
        if( game.dice[d].faces[i] !== game.dice[d].loadOut[i] ){ output = false; }
    }
    return output;
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
    if( up && game.dice[d].faces[f] == getFaceMax() ){ return }
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
    if( up ){
        if( game.auto.loadOut.countDown > 0 ){ game.auto.loadOut.countDown--; }
        else if( !game.auto.loadOut.unlocked ){
            unlock( `auto`, `loadOut` );
            ach.hidden.modPips = true;
        }
        else{ ach.hidden.modPips = true; }
    }
    if( !ach.hidden.populist ){
        let x = 0;
        for( d in game.dice ){
            for( f in game.dice[d].faces ){
                x += game.dice[d].faces[f];
            }
        }
        if( x == 270 ){
            gainAchievement( `hidden`, `populist` );
        }
    }
    
    showUnfolded();
    updateFaces( `all` );
    game.volatile.updateHeader = true;
    game.volatile.updatePpr = true;
}

function getFaceMax(){
    let n = 9;
    if( ach.hidden.populist ){ n = 19; }
    return n;
}

function setLoadout( d ){
    game.dice[d].loadOut = [];
    for( f in game.dice[d].faces ){
        game.dice[d].loadOut.push( game.dice[d].faces[f] );
    }
    showUnfolded();
}
function applyLoadout( d ){
    game.dice[d].autoLoadout = true;
    doLoadout();
    showUnfolded();
}
function unApplyLoadout( d ){
    game.dice[d].autoLoadout = false;
    doLoadout();
    showUnfolded();
}

function buyPip(){
    if( game.points < pipPrice() ){ return }
    game.points -= pipPrice();
    game.pips++;
    game.pipsBought++;
    if( game.auto.pips.countDown > 0 ){ game.auto.pips.countDown--; }
    else if( !game.auto.pips.unlocked ){ unlock( `auto`, `pips` ); }
    updatePipCost();
    game.volatile.updateHeader = true;
    doLoadout();
}

function buyAllPips(){
    let n = 0;
    while( game.points >= pipPrice() ){
        game.points -= pipPrice();
        game.pips++;
        game.pipsBought++;
        n++;
    }
    if( game.auto.pips.countDown > 0 ){ game.auto.pips.countDown -= Math.min( n, game.auto.pips.countDown ); }
    else if( !game.auto.pips.unlocked ){ unlock( `auto`, `pips` ); }
    updatePipCost();
    game.volatile.updateHeader = true;
    doLoadout();
}

function doLoadout(){
    let y = 0;
    let z = 0;
    for( d in game.dice ){
        if( game.dice[d].autoLoadout ){
            let x = 0;
            z += 6;
            for( f in game.dice[d].faces ){
                if( game.dice[d].faces[f] == game.dice[d].loadOut[f] ){ x++; y++; }
                else if( game.dice[d].faces[f] < game.dice[d].loadOut[f] ){ 
                    if( game.pips > 0 ){ modPips( d, f, true ); }
                    else{ y++ }
                }
                else{ modPips( d, f, false ); }
            }
            if( x == 6 && document.querySelector(`.setLoadout[data-ref="${d}"]`) !== null ){ // dice is at loadout
                document.querySelector(`.setLoadout[data-ref="${d}"]`).classList = `isLoadout`;
                console.log( `met`)
            }
        }
    }
    if( y !== z ){ doLoadout(); }
}

function buyUpgrade( type ){
    if( game.points < upgradePrice( type ) ){ return }
    game.points -= upgradePrice( type );
    game.upgrades[type]++;
    game.volatile.updateUpgrades = true;
    game.volatile.updateHeader = true;
    game.volatile.updatePpr = true;
    checkAchieve( `infinite`, `upgrade`, game.upgrades[type], type );
    if( game.auto.upgrades.countDown > 0 ){ game.auto.upgrades.countDown--; }
    else if( !game.auto.upgrades.unlocked ){ unlock( `auto`, `upgrades` ); }
}

function buyAllUpgrades( type ){
    let n = 0;
    while( game.points >= upgradePrice( type ) ){
        game.points -= upgradePrice( type );
        game.upgrades[type]++;
        n++;
        checkAchieve( `infinite`, `upgrade`, game.upgrades[type], type );
    }
    if( game.auto.upgrades.countDown > 0 ){ game.auto.upgrades.countDown -= Math.min( n, game.auto.upgrades.countDown ); }
    else if( !game.auto.upgrades.unlocked ){ unlock( `auto`, `upgrades` ); }
    game.volatile.updateUpgrades = true;
    game.volatile.updateHeader = true;
    game.volatile.updatePpr = true;
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
    updateAscCosts();
    checkAchieve( `infinite`, `ascension`, game.dice[d].asc );
    let min = Infinity;
    for( d in game.dice ){ if( game.dice[d].asc < min ){ min = game.dice[d].asc; } }
    checkAchieve( `infinite`, `minAscension`, min );
    if( game.auto.ascend.countDown > 0 ){ game.auto.ascend.countDown--; }
    else if( !game.auto.ascend.unlocked ){ unlock( `auto`, `ascend` ); }
    game.volatile.updateHeader = true;
    game.volatile.updatePpr = true;
    game.volatile.updateLockedUI = true;
}

function unlock( category, type ){
    game[category][type].unlocked = true;
    game.volatile.updateLockedUI = true;
}

function refreshLockedUI(){
    if( game.auto.ascend.unlocked == true ){
        let b = document.querySelectorAll(`.ascend`);
        for( let i = 0; i < b.length; i++ ){
            let ref = b[i].getAttribute( `data-ascref` );
            b[i].innerHTML = `Ascend`;
            if( b[i].children.length !== 0 ){}
            else{
                let tb = document.createElement(`div`);
                tb.classList = `tickBox ascendAuto`;
                tb.setAttribute(`data-ref`, ref );
                b[i].appendChild(tb);
            }
            if( game.dice[ref].auto ){
                let t = document.createElement(`div`);
                t.classList = `ticked`;
                b[i].children[0].appendChild(t);
            }
        }
    }
    if( game.auto.pips.unlocked == true ){
        let b = document.querySelector(`.buyPip`);
        b.innerHTML = `Buy a pip`;
        let tb = document.createElement(`div`);
        tb.classList = `tickBox buyPipAuto`;
        b.appendChild(tb);
        if( game.auto.pips.on ){
            let t = document.createElement(`div`);
            t.classList = `ticked`;
            b.children[0].appendChild(t);
        }
    }
    if( game.auto.prestige.unlocked == true ){
        if( game.points >= 1e6 ){
            let b = document.querySelector(`.prestige`);
            b.innerHTML = `Prestige`;
            let tb = document.createElement(`div`);
            tb.classList = `tickBox prestigeAuto`;
            b.appendChild(tb);
            if( game.auto.prestige.on ){
                let t = document.createElement(`div`);
                t.classList = `ticked`;
                b.children[0].appendChild(t);
            }
        }
    }
    if( game.auto.upgrades.unlocked == true ){
        let b = document.querySelectorAll(`.upgrade`);
        for( let i = 0; i < b.length; i++ ){
            let ref = b[i].getAttribute( `data-ref` );
            b[i].innerHTML = `Upgrade`;
            if( b[i].children.length !== 0 ){}
            else{
                let tb = document.createElement(`div`);
                tb.classList = `tickBox upgradeAuto`;
                tb.setAttribute(`data-ref`, ref );
                b[i].appendChild(tb);
            }
            if( game.auto.upgrades.state[ref] ){
                let t = document.createElement(`div`);
                t.classList = `ticked`;
                b[i].children[0].appendChild(t);
            }
        }
    }
    let h = false;
    for( a in ach.hidden ){ if( ach.hidden[a] ){ h = true; } }
    if( h ){ document.querySelector(`.hidden`).classList.remove(`noDisplay`); }
}

function toggleAutoAscend( d ){
    if( game.dice[d].auto ){ game.dice[d].auto = false; }
    else{ game.dice[d].auto = true; }
    game.volatile.updateLockedUI = true;
}
function toggleAutoPips(){
    if( game.auto.pips.on ){ game.auto.pips.on = false; }
    else{ game.auto.pips.on = true; }
    game.volatile.updateLockedUI = true;
}
function toggleAutoUpgrade( u ){
    if( game.auto.upgrades.state[u] ){ game.auto.upgrades.state[u] = false; }
    else{ game.auto.upgrades.state[u] = true; }
    game.volatile.updateLockedUI = true;
}
function toggleAutoPrestige(){
    if( game.auto.prestige.on ){ game.auto.prestige.on = false; }
    else{ game.auto.prestige.on = true; }
    game.volatile.updateLockedUI = true;
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
    if( delta > 0 ){ suff = ` and +${ numDisplay( delta ) }x to all rolls`.replace(` +1x`, game.prestige.watermark == 0 ? ` 1x ( no benefit )` : ` +1x` ).replace( ` +`, game.prestige.watermark == 0 ? ` ` : ` +`); }
    document.getElementById(`prestige`).innerHTML = `<div class="button prestige">Prestige</div> to receive ${numDisplay( pg ) } PP${suff}`;
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
    let base = Math.max( 0, Math.floor( Math.pow( Math.log10( Math.max( 1, game.points / ( Math.pow( 10, game.prestige.floor ) ) ) ), 2 ) ) );
    let aMod = Math.pow( 1.01, ach.balance.infinite );
    let bMod = 1;
    if( ach.hidden.masochist ){ bMod = 1 + Object.keys( game.arrs ).length / 1000; }
    return Math.round( base * aMod * bMod );
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
    game.volatile.updateHeader = true;
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
    game.volatile.updateHeader = true;
    updatePipCost();
    game.volatile.updateUpgrades = true;
    updateFaces( `all` );
    showUnfolded();
    game.volatile.updatePpr = true;
    conditionalShow();
    updateAscCosts();
    if( game.auto.prestige.countDown > 0 ){ game.auto.prestige.countDown--; }
    else if( !game.auto.prestige.unlocked ){ unlock( `auto`, `prestige` ); }
    localStorage.setItem( `backup-game` , JSON.stringify( game ) );
    localStorage.setItem( `backup-ach` , JSON.stringify( ach ) );
    doLoadout();
}


var game = {
    dice: [
        { faces: [0,0,0,0,0,0], asc: 0, loadOut: [0,0,0,0,0,0], auto: false, autoLoadout: false }
        , { faces: [0,0,0,0,0,0], asc: 0, loadOut: [0,0,0,0,0,0], auto: false, autoLoadout: false }
        , { faces: [0,0,0,0,0,0], asc: 0, loadOut: [0,0,0,0,0,0], auto: false, autoLoadout: false }
        , { faces: [0,0,0,0,0,0], asc: 0, loadOut: [0,0,0,0,0,0], auto: false, autoLoadout: false }
        , { faces: [0,0,0,0,0,0], asc: 0, loadOut: [0,0,0,0,0,0], auto: false, autoLoadout: false }
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
            , upgPower: { impact: 0.9, amt: 0, cost: 8, costScale: 2, type: `power`,   disp: `Multiplier Cost`, desc: `Multiplier upgrade price creep reduced by 10%` }
            , pipPower: { impact: 0.8, amt: 0, cost: 20, costScale: 2, type: `power`,   disp: `Pip Price Power`, desc: `Pip price creep reduced by 20%` }
            , autoTime: { impact: 0.75, amt: 0, cost: 25, costScale: 2, type: `power`,  disp: `Speedy Roller`, desc: `Reduce time between rolls by 25%` }
            , square: { impact: 1, amt: 0, cost: 50, costScale: 2, type: `multiply`,    disp: `Adding Squared`, desc: `Dice values gain x<sup>+1 </sup> for additions` }
            , spares: { impact: 1, amt: 0, cost: 250, costScale: 2, type: `multiply`,   disp: `Spare PPower`, desc: `Results x floor( log10( unspent PP ) )` }
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
        , pause: false
        , updatePpr: false
        , updateHeader: false
        , updateUpgrades: false
        , updateLockedUI: false
    }
    , animationTime: 2000
    , settleTime: 350
    , tickTime: 25
    , auto: {
        ascend: { unlocked: false, countDown: 1e2 }
        , upgrades: { unlocked: false, countDown: 1e4, state: { five: false, four: false, three: false, two: false, twoPair: false, fullHouse: false, straight: false } }
        , pips: { unlocked: false, countDown: 1e3, on: false }
        , loadOut: { unlocked: false, countDown: 2e3, setup: [ [], [], [], [], [] ], on: false }
        , prestige: { unlocked: false, countDown: 50, on: false }
    }
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
    if( !game.volatile.masochist ){
        let masochist = true;
        for( a in ach.finite ){
            for( b in ach.finite[a] ){
                if( !ach.finite[a][b] ){ masochist = false; break; }
            }
        }
        if( masochist ){
            ach.hidden.masochist = true;
        }
    }
    game.volatile.updatePpr = true;
}

function gainAchievement( group, type, subtype ){
    rebalanceAchievement();
    if( group == `hidden` && type == `populist` ){
        ach.hidden.populist = true;
        for( let i = 10; i < 20; i++ ){
            if( ach.finite[`r${i}`] == undefined ){
                ach.finite[`r${i}`] = { five: false, four: false, three: false, two: false, straight: false, twoPair: false, fullHouse: false };
            }
        }
    }
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
    , hidden: { 
        masochist: false
        , populist: false
        , modPips: false
    }
    , balance: { infinite: 0, finite: 0, hidden: 0 }
}

let aDictionary = {
    ascension: { name: `Ascension`, desc: `Ascend a die to rank #`, comp: `Ascended a die to rank # for the first time!` },
    minAscension: { name: `Ascend-All`, desc: `Ascend all dice to rank #`, comp: `Ascended all dice to rank # for the first time!` },
    score: { name: `High Score`, desc: `Reach a score of 1.000 x 10<sup style="margin-bottom: 0.6rem;">#</sup>`, comp: `Reachd a score of 10 x <sup>#</sup> for the first time!` },
    rollsAuto: { name: `Auto Roller`, desc: `Let the dice roll # times automatically`, comp: `# automatic rolls!` },
    rollsManual: { name: `Hands On`, desc: `Roll the dice # times manually`, comp: `# manual rolls!` },
    upgrade: { name: `Upgrade ?`, desc: `Upgrade ? Multiplier # times`, comp: `? upgraded # times!` },
    combo: { name: `Roll a ?`, desc: `Rolled ? # times`, comp: `? rolled # times!` },
}

function autoAscend(){
    let proceed = false;
    for( d in game.dice ){
        if( game.dice[d].auto == undefined ){ game.dice[d].auto = false; }
        if( game.dice[d].auto ){ proceed = true; }
    }
    if( proceed ){
        let changed = true;
        while( changed ){
            let min = Infinity;
            let choice = null;
            for( d in game.dice ){
                if( !game.dice[d].auto ){}
                else if( game.dice[d].asc < min ){ min = game.dice[d].asc; choice = d; }
            }
            let current = 0;
            for( e in game.dice ){
                for( f in game.dice[e].faces ){
                    current += game.dice[e].faces[f];
                }
            }
            if( current + game.pips > getAscCost( choice ) && game.pips >= getAscCost( choice ) ){ ascendDie( choice ); }
            else{ changed = false; }
        }
    }
}

function autoPips(){
    if( game.auto.pips.on ){
        if( game.points >= pipPrice() ){ buyAllPips(); }
    }
}
function autoPrestige(){
    if( game.auto.prestige.on ){
        if( prestigeGains() >= game.prestige.watermark * 0.9 ){ prestige(); }
    }
}

function autoUpgrade(){
    let s = [];
    for( u in multNames ){
        let id = multNames[u].id;
        if( game.auto.upgrades.state[id] ){ s.push( id ); }
    }
    let end = false;
    while( !end ){
        end = true;
        for( let i = 0; i < s.length; i++ ){
            if( game.points >= upgradePrice( s[i] ) ){
                game.points -= upgradePrice( s[i] );
                game.upgrades[s[i]]++;
                end = false;
            }
        }
    }
    game.volatile.updateUpgrades = true;
    game.volatile.updateHeader = true;
    game.volatile.updatePpr = true;
    for( u in multNames ){
        checkAchieve( `infinite`, `upgrade`, game.upgrades[multNames[u].id], multNames[u].id );
    }
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
    for( let i = 0; i <= getFaceMax(); i++ ){ a[i] = 0; }
    for( i in arr ){ a[arr[i]]++; }
    for( let i = 0; i <= getFaceMax(); i++ ){
        if( i < getFaceMax() - 3 ){
            if( a[i] == 1 && a[i+1] == 1 && a[i+2] == 1 && a[i+3] == 1 && a[i+4] == 1 ){ multi = `straight`; return [ multiplier[multi] * ( 1 + game.upgrades[multi] ) * mod, multi, arr ]; }
        }
    }
    for( let i = 0; i <= getFaceMax(); i++ ){
        if( a[i] == 5 ){ multi = `five`; return [ multiplier[multi] * ( 1 + game.upgrades[multi] ) * mod, multi, [i] ]; }
    }
    for( let i = 0; i <= getFaceMax(); i++ ){
        if( a[i] == 4 ){ multi = `four`; return [ multiplier[multi] * ( 1 + game.upgrades[multi] ) * mod, multi, [i] ]; }
    }
    for( let i = 0; i <= getFaceMax(); i++ ){
        if( a[i] == 3 ){
            for( let j = 0; j <= getFaceMax(); j++ ){
                if( a[j] == 2 ){ multi = `fullHouse`; return [ multiplier[multi] * ( 1 + game.upgrades[multi] ) * mod, multi, [i,j] ]; }
            }
            multi = `three`; return [ multiplier[multi] * ( 1 + game.upgrades[multi] ) * mod, multi, [i] ];
        }
    }
    for( let i = 0; i <= getFaceMax(); i++ ){
        if( a[i] == 2 ){
            for( let j = 0; j <= getFaceMax(); j++ ){
                if( i == j ){}
                else if( a[j] == 2 ){ multi = `twoPair`; return [ multiplier[multi] * ( 1 + game.upgrades[multi] ) * mod, multi, [i,j] ]; }
            }
            multi = `two`; return [ multiplier[multi] * ( 1 + game.upgrades[multi] ) * mod, multi, [i] ];
        }
    }
    return [ 1, multi, [] ];
}

// function parseMultiplier(arr) {
//     const u = getPerk(`upgrades`);
//     const mod = u > 0 ? 1 + getPerk(`upgrades`) * getUpgradeRanks() / 100 : 1;
//     const counts = arr.reduce((counts, face) => {
//       counts[face] = (counts[face] || 0) + 1;
//       return counts;
//     }, {});
//     const multiples = Object.entries(counts).filter(([, count]) => count > 1);
//     multiples.sort(([, countA], [, countB]) => countB - countA);
//     let multi;
//     let faces;
//     if (multiples.length === 5) { multi = `straight`; faces = arr; }
//     else { const [face, count] = multiples[0];
//       if (count === 5) { multi = `five`; faces = [face]; }
//       else if (count === 4) { multi = `four`; faces = [face]; }
//       else if (count === 3) { 
//         if (multiples.length > 1) { multi = `fullHouse`; faces = [face, multiples[1][0]]; }
//         else { multi = `three`; faces = [face]; }
//       }
//       else if (count === 2) {
//         if (multiples.length > 1) { multi = `twoPair`; faces = [face, multiples[1][0]]; }
//         else { multi = `two`; faces = [face]; }
//       }
//     }
//     return [multiplier[multi] * (1 + game.upgrades[multi]) * mod, multi, faces || []];
//   }

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
    let ppp = Math.max( 1, Math.floor( Math.log10( ( isNaN( game.prestige.curr ) ? 0 : game.prestige.curr ) + 1 ) ) * getPerk(`spares`) );
    if( isNaN( ppp ) ){ ppp = 0; }
    game.points += p * o * m * Math.pow( 10, b ) * ( pres * Math.max( 1, ppp ) );
    game.volatile.lastRoll = now();
    autoAscend();
    autoUpgrade();
    autoPips();
    doLoadout(); 
    autoPrestige();
    game.volatile.updateHeader = true;
    postResults( p, o, m, b, pres, ppp );
    checkAchieve( `infinite`, `score`, game.points );
    game.volatile.updateLockedUI = true;
    saveState();
}

function postResults( p, o, m, b, pres, ppp ){
    if( ppp == undefined ){ ppp = 1 }
    let t = document.getElementById(`results`);
    if( t.children.length > 0 ){ t.lastChild.remove(); }
    while( t.children.length > 9 ){ t.firstChild.remove(); }
    let n = document.createElement(`div`);
    n.classList = `resultRow`;
    n.innerHTML = ``;
    if( game.prestige.watermark > 0 ){ n.innerHTML += `${numDisplay( pres )}x `}
    n.innerHTML += `( ${ numDisplay( p ) } ) x [ ${ numDisplay( o ) } ] x { ${ numDisplay( m ) } } x 10<sup>${ numDisplay( b )}</sup>${ ppp > 0 ? ' x ' + numDisplay( ppp ) : '' } = <a class="emph">${ numDisplay( p * o * m * pres * Math.pow( 10, b ) * ppp ) }</a>`;
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
    if( game.volatile.pause ){ return }
    if( game.volatile.ttnr > ( game.baseTTNR * getPerk( `autoTime` ) ) ){ return }
    else{ spinAll(); game.rolls.manual++; checkAchieve( `infinite`, `rolls`, game.rolls.manual, `manual` ); }
}

function showPpr(){
    let o = ppr();
    document.querySelector(`[data-ref="ppm"]`).innerHTML = numDisplay( o.ppr * 60000 / ( ( game.baseTTNR * getPerk( `autoTime` ) ) + getAnimationTime( true ) ) );
    document.querySelector(`[data-ref="min"]`).innerHTML = numDisplay( o.min );
    document.querySelector(`[data-ref="max"]`).innerHTML = numDisplay( o.max );
    if( ach.hidden.masochist ){
        let t = document.querySelector(`[data-ref="unique"]`);
        t.parentElement.classList.remove(`noDisplay`);
        let x = 100000;
        if( ach.hidden.populist ){ x = 3200000; }
        t.innerHTML = numDisplay( Object.keys( game.arrs ).length ) + ` / ${numDisplay( x )}`;
        let u = document.querySelector(`[data-ref="uSet"]`);
        u.parentElement.classList.remove(`noDisplay`);
        let g = new Set( o.got ).size;
        let p = new Set( o.possible ).size;
        u.innerHTML = numDisplay( Math.floor( g / p * 100 ) ) + `%`;
    }
}

function ppr(){
    let score = 0;
    let max = 0;
    let min = Infinity;
    // let ppp = Math.max( 1, Math.floor( Math.abs( Math.log10( game.prestige.curr ) ) == Infinity ? 1 : Math.log10( game.prestige.curr ) + 1 ) * getPerk(`spares`) );
    let ppp = Math.max( 1, Math.floor( Math.log10( ( isNaN( game.prestige.curr ) ? 0 : game.prestige.curr ) + 1 ) ) * getPerk(`spares`) );
    if( isNaN( ppp ) ){ ppp = 0; }
    if( ppp == Infinity ){ ppp = 1; }
    let got = [];
    let possible = [];
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
                        let result = ( sq(aa) + sq(bb) + sq(cc) + sq(dd) + sq(ee) ) * o * m * pres * Math.max( 1, ppp );
                        score += result;
                        if( result < min ){ min = result; }
                        if( result > max ){ max = result; }
                        let r = `r${aa}${bb}${cc}${dd}${ee}`;
                        possible.push( r );
                        if( game.arrs[r] !== undefined ){ got.push( r ); }
                    }
                }
            }
        }
    }
    return { cumTotal: score, ppr: Math.floor( score / 7776 ), min: min, max: max, got: got, possible: possible }
}

function sq( n ){
    return Math.pow( n, getPerk( `square` ) + 1 );
}

function zen(){
    document.getElementById(`header`).classList.toggle(`noDisplay`);
    document.getElementById(`footer`).classList.toggle(`noDisplay`);
    document.querySelector(`.info`).classList.toggle(`noDisplay`);
    document.querySelector(`.achievements`).classList.toggle(`noDisplay`);
    document.querySelector(`.hidden`).classList.toggle(`noDisplay`);
    document.querySelector(`.leftSection`).classList.toggle(`noDisplay`);
    document.querySelector(`.rightSection`).classList.toggle(`noDisplay`);
    document.querySelector(`.topRow`).classList.toggle(`noDisplay`);
    document.querySelector(`#lastRow`).classList.toggle(`noDisplay`);
    if( getComputedStyle(document.querySelector(':root') ).getPropertyValue('--face') == `10rem` ){
        document.querySelector(':root').style.setProperty('--face', '5rem');
    }
    else{ document.querySelector(':root').style.setProperty('--face', '10rem'); }
    resize();
}

function pause(){
    if( game.volatile.pause ){ game.volatile.pause = false; }
    else{ game.volatile.pause = true; }
}

function showModal(){
    document.querySelector(`.modal`).classList.toggle(`noDisplay`);
}

function ppModal(){
    document.querySelector(`.modal`).classList.remove(`noDisplay`);
    let t = document.querySelector(`.modalContainer`);
    t.innerHTML = `<div class="heading firstH">Perks</div>`;
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
    t.innerHTML = `
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
    <div class="bundle">
    <div class="key">z</div>
    <div class="descriptor">Zen Mode (hides all UI but the dice)</div>
    </div>
    <div class="bundle">
    <div class="key">[Esc]</div>
    <div class="descriptor">Pause the game (in case you want to for some reason)</div>
    </div>
    <div class="deets"></div>
    <div class="deets"><b>Tips & General Advice</b></div>
    <div class="deets"><i>Finite</i> Achievements speed up the animation time of the dice rolling</div>
    <div class="deets"><i>Infinite</i> Achievements may be achieved again and again, and keep adding bonuses when gained</div>
    <div class="deets"><i>Hidden</i> Achievements probably don't even exist, but if they did, they'd give you cool new capabilities</div>
    <div class="deets">After your first Prestige at one million points (or more), you will be gain access to Perks</div>
    <div class="deets">Blank-face dice are completely ignored for the purposes of calculating score (including their ascension level!)</div>
    <div class="deets">The Results rows can be a bit confusing - you'll figure it out ... only the final number really matters anyway ;)</div>
    <div class="deets"></div>
    <div class="deets"><b>Stuck?</b></div>
    <div class="generalText"><a>Perform a </a><div class="button softReset">Soft Reset</div><a> to reset to your last Prestige, or if you want to clear everything, perform a </a><div class="button hardReset">Hard Reset</div></div>
    `;
}

function achieveModal(){
    document.querySelector(`.modal`).classList.remove(`noDisplay`);
    let t = document.querySelector(`.modalContainer`);
    let q = `<div class="dCol f1 padMe"></div>
            <div class="dCol f2 padMe"></div>
            <div class="dCol f3 padMe"></div>
            <div class="dCol f4 padMe"></div>
            <div class="dCol f5 padMe"></div>
            <div class="dCol f6 padMe"></div>
            <div class="dCol f7 padMe"></div>
            <div class="dCol f8 padMe"></div>
            <div class="dCol f9 padMe"></div>`;
    if( ach.hidden.populist ){
        q += `<div class="dCol f10 padMe"></div>
            <div class="dCol f11 padMe"></div>
            <div class="dCol f12 padMe"></div>
            <div class="dCol f13 padMe"></div>
            <div class="dCol f14 padMe"></div>
            <div class="dCol f15 padMe"></div>
            <div class="dCol f16 padMe"></div>
            <div class="dCol f17 padMe"></div>
            <div class="dCol f18 padMe"></div>
            <div class="dCol f19 padMe"></div>`
    }
    t.innerHTML = `
    <div class="heading firstH">Finite Achievements</div>
    <div class="deets">Each Multiplier combo below achieved with the face value shown speeds up the animation time by 0.5% (additive), currently -${numDisplay( ( 0.5 * ach.balance.finite ) )}%</div>
    <div class="achTable">
        <div class="hRow">
            <div class="hCol"><div class="space"></div>Combo</div>${q}
        </div>
    </div>
    <div class="heading">Infinite Achievements</div>
    <div class="deets">Every rank of each achievement below improves your Prestige Points (PP) rewards by 1% (compounding), currently +${numDisplay( ( Math.pow( 1.01, ach.balance.infinite ) - 1 ) * 100 )}%</div>
    <div class="achContainer"></div>
    `;
    buildInfiniteTable();
    buildFiniteTable();
}

function buildFiniteTable(){
    let t = document.querySelector(`.achTable`);
    if( getFaceMax() == 19 ){ t.classList.add(`longTable`); }
    let i = 0;
    for( m in multNames ){
        let row = document.createElement(`div`);
        row.classList = `xRow ${i % 2 == 0 ? "shade" : ""}`;
        row.innerHTML = `<div class="hRow"><div class="space"></div>${multNames[m].name}</div>`;
        for( let d = 1; d <= getFaceMax(); d++ ){
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

function hiddenModal(){
    document.querySelector(`.modal`).classList.remove(`noDisplay`);
    let t = document.querySelector(`.modalContainer`);
    t.innerHTML = `
    <div class="heading firstH">Hidden Achievements</div>`
    if( ach.hidden.masochist ){
        let masochist = document.createElement(`div`);
        let x = 100000;
        if( ach.hidden.populist ){ x = 3200000; }
        masochist.classList = `intrusion`;
        masochist.innerHTML = `<div class="heading">Masochist</div>
        <div class="deets">I guess you are a completionist, then ... that's fine. However you define fun is fine by me.</div>
        <div class="deets">You now gain a 0.1% bonus to PP for every unique combination of face values you roll (order matters).</div>
        <div class="deets">You're up to ${numDisplay( Object.keys( game.arrs ).length )} unique face value combinations out of a possible ${numDisplay( x )}.</div>
        <div class="deets">Good luck with that.</div>`
        t.appendChild( masochist );
    }
    if( ach.hidden.populist ){
        let populist = document.createElement(`div`);
        populist.classList = `intrusion`;
        populist.innerHTML = `<div class="heading">Populist</div>
        <div class="deets">Okay okay - you got a nine on ever face of every dice. Why though? Just to see what might happen?</div>
        <div class="deets">Well now this has happened.</div>
        <div class="deets">You can now increase the face of any die up to 19 pips.</div>
        <div class="deets">Finite Achievements have been extended to accomodate new possibilities.</div>
        <div class="deets">This new cap of 19 is not going to be increased again, so don't be disappointed if you try and nothing happens.</div>`
        t.appendChild( populist );
    }
    if( ach.hidden.modPips ){
        let modPips = document.createElement(`div`);
        modPips.classList = `intrusion`;
        modPips.innerHTML = `<div class="heading">Power Pipper</div>
        <div class="deets">You've manually added 2,000 pips since you started playing. That's a lot.</div>
        <div class="deets">To help improve your quality of life, you can now save Loadouts for your dice.</div>
        <div class="deets">Each die can have only one Loadout saved.</div>
        <div class="deets">When active, your pips will be automatically spent and placed until your die matches its Loadout.</div>
        <div class="deets">You can change your Loadout at any time, but make sure to disable it before making changes.</div>`
        t.appendChild( modPips );
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
    return `${m} ?? 10<sup>${ n }</sup>`;
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
        if( g.dice[d].loadOut !== undefined ){
            if( g.dice[d].loadOut.length > 0 ){
                game.dice[d].loadOut = g.dice[d].loadOut;
                game.dice[d].auto = g.dice[d].auto;
                if( g.dice[d].autoLoadout !== undefined ){
                    game.dice[d].autoLoadout = g.dice[d].autoLoadout;
                }
            }
        }
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
    for( i in a.hidden ){
        ach.hidden[i] = a.hidden[i];
    }
    ach.finite = a.finite;
    // Data Fixing
    if( g.auto !== undefined ){
        for( a in g.auto ){ game.auto[a] = g.auto[a]; }
        for( d in game.dice ){ game.dice[d].auto = g.dice[d].auto; }
    }
    rebalanceAchievement();
}

setInterval(() => { tickDown() }, game.tickTime );

/*
TODO

Build a Modale screen which unlocks after you get to 95,000 / 100,000 which prints out the missing combinations

Slider for Auto-Prestige (as % of watermark)

Rewire auto ascend to reaching minASC = 7 (all dice looped through to the second time of blue)
- Automate Ascension going forard
- Every rank of ascension adds 1% to the resultant PP ?

All Automation On / Off
Move lifetime / auto achievements to Hidden with snarky text

Get a number of junk rolls, gain a junk roll multiplier which is based on total junk rolls rolled

Toasties

BORING
If you get the same face value array 100 times in a row
- Gain a slow-growing multiplier to points which grows every roll until a duplicate roll occurs
- - Duplicate defined here as the same array of scorable values, not the unique face values of dice
- Resets to zero on duplicate roll from previously rolled arrays

RISK TAKER
If MAX / PPR > 7770 (only get points on a super unlikely roll)

MANUAL DRIVER
If you hit 10,000 manual rolls
- Refund any points spent on reducing the auto-roller time
- Set the time between rolls to zero
- All rolls now count as Manual AND Automatic for the purposes of achievements


IDEAS

Prestige Perks
- Unspent, Unplaced Pips help somehow ?

~ Lucky Face ? Add to one dice to Nx the result when that face lands ?
~ Luck Face which provides 1x score, then when rolled again 2x, then 4x



*/

