// public/jeux/toilette.js
function initJeu() {
  const container = document.getElementById("gameContent");
  container.innerHTML = `
    <style>
      /* On ne fixe PAS la hauteur ; on laisse le body défiler */
      html, body {
        margin:0; padding:0;
        width:100%;
        overflow-x:hidden;
      }
      #gameWrapper {
        box-sizing: border-box;
        padding: 10px 10px 50px; /* espace en bas pour bouton */
//      height: auto;  <-- supprimé height fixe
        background: #fafafa;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 15px;
        width: 100%;
      }
      h2 { margin: 0; }

      /* Stats alignées horizontalement */
      #stats {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        align-items: center;
        gap: 10px;
        font-size: 1rem;
        font-weight: bold;
      }

      button {
        cursor: pointer;
        border: none;
        border-radius: 8px;
        transition: transform .1s;
      }
      button:hover { transform: scale(1.05); }

      /* Bouton principal */
      #clickerBtn {
        background: #5e60ce;
        color: #fff;
        padding: 1rem;
        width: 90%;
        max-width: 400px;
        font-size: 1.2rem;
      }

      /* Titres de section */
      .titleSection {
        width: 100%;
        max-width: 400px;
        font-size: 1.1rem;
        font-weight: bold;
        margin-top: 20px;
        margin-bottom: 5px;
      }

      /* Listes verticales */
      #prestigeList, #upgradeList {
        display: flex;
        flex-direction: column;
        gap: 10px;
        width: 100%;
        max-width: 400px;
      }

      /* Cartes d’amélioration */
      .upgradeItem {
        background: #fff;
        border: 2px solid #ccc;
        border-radius: 8px;
        padding: 10px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        display: flex;
        flex-direction: column;
        gap: 5px;
      }
      .upgradeItem button {
        padding: 0.5rem;
        font-size: 1rem;
        background: #ffd60a;
        color: #222;
      }
      .prestigeItem button {
        background: #ff4d6d;
        color: #fff;
      }

      /* Bouton de prestige */
      #prestigeBtn {
        background: #ff4d6d;
        color: #fff;
        padding: 0.8rem;
        width: 90%;
        max-width: 400px;
        font-size: 1.1rem;
      }

      /* Notification en bas */
      #achievementNotif {
        position: fixed;
        bottom: 10px;
        left: 50%;
        transform: translateX(-50%);
        background: #fff6cc;
        padding: 8px 16px;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        opacity: 0;
        transition: opacity .3s;
      }

      /* Responsive mobile */
      @media (max-width: 600px) {
        #clickerBtn { font-size: 1rem; }
        button {
          width: 100%;
          font-size: 0.9rem;
        }
      }
    </style>

    <div id="gameWrapper">
      <h2>🚽 Toilette Tycoon</h2>

      <div id="stats">
        <div id="balanceDisplay">🪙 Argent : 0</div>
        <div id="gainRate">⏱️ Gain : 0 💩/s</div>
        <div id="prestigeCounter">🏆 Prestige : 0</div>
      </div>

      <button id="clickerBtn">💩 Faire 💩</button>

      <div class="titleSection">🔧 Améliorations de Prestige</div>
      <div id="prestigeList"></div>
      <button id="prestigeBtn">🏆 Faire un Prestige</button>

      <div class="titleSection">💼 Améliorations de Production</div>
      <div id="upgradeList"></div>
    </div>

    <div id="achievementNotif"></div>
  `;

  // — état du jeu —
  let balance        = 0;
  let increment      = 0;
  let clickCount     = 0;
  let prestige       = 0;
  let boostActive    = false;

  // — définitions —
  const upgrades = [
    { name:"Papier Toilette",    base:10,   cost:10,   value:0.2,  owned:0 },
    { name:"Parfum WC",          base:50,   cost:50,   value:1,    owned:0 },
    { name:"Canalisation Turbo", base:200,  cost:200,  value:3,    owned:0 },
    { name:"Robot de Chasse",    base:1000, cost:1000, value:6,    owned:0 },
    { name:"WC Auto-Nettoyant",  base:5000, cost:5000, value:15,   owned:0 }
  ];
  const prestigeUps = [
    { name:"💰 Bonus vente",   mul:1.05, level:0 },
    { name:"🛍️ Réduc. prix",   mul:0.95, level:0 },
    { name:"🚀 Prod. Globale", mul:1.05, level:0 }
  ];

  // — DOM refs —
  const balanceDisp     = document.getElementById("balanceDisplay");
  const gainRateDisp    = document.getElementById("gainRate");
  const prestigeCounter = document.getElementById("prestigeCounter");
  const clickerBtn      = document.getElementById("clickerBtn");
  const upgradeList     = document.getElementById("upgradeList");
  const prestigeList    = document.getElementById("prestigeList");
  const prestigeBtn     = document.getElementById("prestigeBtn");
  const notifDiv        = document.getElementById("achievementNotif");

  function showNotif(txt) {
    notifDiv.textContent = txt;
    notifDiv.style.opacity = 1;
    setTimeout(() => notifDiv.style.opacity = 0, 2000);
  }

  function renderPrestige() {
    prestigeList.innerHTML = "";
    prestigeUps.forEach((up,i) => {
      const div = document.createElement("div");
      div.className = "upgradeItem prestigeItem";
      div.innerHTML = `
        <div><strong>${up.name}</strong></div>
        <div>niveau ${up.level}</div>
        <button ${prestige<1?'disabled':''}>Améliorer</button>
      `;
      div.querySelector("button").onclick = () => {
        if (prestige>0) {
          up.level++;
          showNotif(`✨ ${up.name} → niveau ${up.level}`);
          updateUI();
        }
      };
      prestigeList.appendChild(div);
    });
  }

  upgrades.forEach((u,i) => {
    const div = document.createElement("div");
    div.className = "upgradeItem";
    div.innerHTML = `
      <div><strong>${u.name}</strong> (x<span id="owned-${i}">0</span>)</div>
      <div>🪙 <span id="cost-${i}">${u.cost}</span> → +${u.value}/s</div>
      <button id="buy-${i}">Acheter</button>
    `;
    upgradeList.appendChild(div);
    div.querySelector("button").onclick = () => {
      const bonusSell = Math.pow(prestigeUps[0].mul, prestigeUps[0].level);
      const priceRed  = Math.pow(prestigeUps[1].mul, prestigeUps[1].level);
      if (balance >= u.cost) {
        balance   -= u.cost;
        u.owned   += 1;
        increment += u.value * Math.pow(prestigeUps[2].mul, prestigeUps[2].level);
        u.cost     = Math.ceil(u.base * Math.pow(1.9, u.owned) * priceRed);
        showNotif(`🛒 ${u.name} acheté !`);
        updateUI();
      }
    };
  });

  function getPrestigeCost() {
    return 10000 * Math.pow(2, prestige);
  }

  function updateUI() {
    const bonusSell = Math.pow(prestigeUps[0].mul, prestigeUps[0].level);
    const gain      = increment * bonusSell * (boostActive?2:1);

    balanceDisp.textContent     = `🪙 Argent : ${balance.toFixed(1)}`;
    gainRateDisp.textContent    = `⏱️ Gain : ${gain.toFixed(2)} 💩/s`;
    prestigeCounter.textContent = `🏆 Prestige : ${prestige}`;

    upgrades.forEach((u,i) => {
      document.getElementById(`owned-${i}`).textContent = u.owned;
      document.getElementById(`cost-${i}`).textContent  = u.cost;
      document.getElementById(`buy-${i}`).disabled     = balance < u.cost;
    });

    renderPrestige();
    prestigeBtn.disabled = balance < getPrestigeCost();
  }

  clickerBtn.onclick = () => {
    const bonusSell = Math.pow(prestigeUps[0].mul, prestigeUps[0].level);
    balance += 1 * bonusSell;
    clickCount++;
    if (clickCount>=30 && !boostActive) {
      boostActive = true;
      setTimeout(()=>{
        boostActive = false;
        updateUI();
      }, 10000);
    }
    updateUI();
  };

  prestigeBtn.onclick = () => {
    if (balance >= getPrestigeCost()) {
      prestige++;
      balance=increment=clickCount=0;
      upgrades.forEach(u=>{ u.owned=0; u.cost=u.base; });
      showNotif("🔄 Prestige activé !");
      updateUI();
    }
  };

  setInterval(()=>{
    if (increment>0) {
      const bonusSell = Math.pow(prestigeUps[0].mul, prestigeUps[0].level);
      balance += (increment * bonusSell * (boostActive?2:1))/20;
      updateUI();
    }
  },50);

  // affichage initial
  updateUI();
}

window.initJeu = initJeu;
