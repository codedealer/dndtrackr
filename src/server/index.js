import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/database'
import 'firebase/functions'
import * as firebaseui from 'firebaseui'
import config from './config.json'
import axios from 'axios'

let cache = {};
let spellCache = {};
axios.defaults.headers.post['Content-Type'] = 'application/json';
export default {
  connect (userState) {
    if (this.db) return;

    let app = firebase.initializeApp(config);
    let uiConfig = {
      callbacks: {
        signInSuccessWithAuthResult (authResult) { console.log(authResult) }
      },
      signInFlow: 'popup',
      signInOptions: [
        firebase.auth.GoogleAuthProvider.PROVIDER_ID
      ]
    };

    let ui = new firebaseui.auth.AuthUI(firebase.auth(app));

    ui.start('#ui-container', uiConfig);

    firebase.auth(app).onAuthStateChanged(user => {
      if (user) {
        userState.state = 1;
        userState.displayName = user.displayName;
        userState.uid = user.uid;
        this.fetchUserMonsters(userState.uid).then((names) => { userState.monsters = names });
        this.fetchUserSpells(userState.uid).then(spells => { userState.spells = spells });
      } else {
        userState.state = 0;
      }
    }, error => { console.log(error) });

    this.db = firebase.database(app);
    this.app = app;
  },
  signOut () {
    firebase.auth(this.app).signOut();
  },
  addMonster (user, monster) {
    const url = 'https://us-central1-dndtrackr.cloudfunctions.net/app/monster';

    return new Promise((resolve, reject) => {
      firebase.auth(this.app).currentUser.getIdToken().then(token => {
        axios.post(url, JSON.stringify(monster), {headers: {'Authorization': 'Bearer ' + token}})
          .then(response => {
            if (response.data.error) {
              console.error(response.data.error);
              reject(new Error(response.data.error));
              return;
            }
            if (!response.data.key) {
              reject(new Error('No entry key for monster received'));
              return;
            }

            let m = user.monsters.find(o => o.key === response.data.key);

            if (!m) {
              user.monsters.push({
                key: response.data.key,
                name: response.data.name
              });
            } else {
              m.name = response.data.name;
            }

            resolve(response.data.key);
          })
          .catch(e => { console.error(e); resolve(); })
          ;
      });
    });
  },
  addSpell (user, spell) {
    const url = 'https://us-central1-dndtrackr.cloudfunctions.net/app/spell';

    return new Promise((resolve, reject) => {
      firebase.auth(this.app).currentUser.getIdToken().then(token => {
        axios.post(url, JSON.stringify(spell), {headers: {'Authorization': 'Bearer ' + token}})
        .then(response => {
          if (response.data.error) {
            console.error(response.data.error);
            reject(new Error(response.data.error));
            return;
          }
          if (!response.data.key) {
            reject(new Error('No entry key for monster received'));
            return;
          }

          user.spells.push({
            key: response.data.key,
            name: response.data.name
          });
          resolve();
        })
        .catch(e => { console.error(e); reject(e) })
      });
    });
  },
  removeMonster (monster) {
    let uid = firebase.auth(this.app).currentUser.uid;
    let updateObject = {};

    updateObject[`monsters/${monster.key}`] = null;
    updateObject[`userMonsters/${uid}/${monster.key}`] = null;
    updateObject[`userMonstersMeta/${monster.key}`] = null;

    this.db.ref().update(updateObject);
  },
  removeSpell (spell) {
    let uid = firebase.auth(this.app).currentUser.uid;
    let updateObject = {};

    updateObject[`spells/${spell.key}`] = null;
    updateObject[`userSpells/${uid}/${spell.key}`] = null;

    this.db.ref().update(updateObject);
  },
  editMonster (monster) {
    return new Promise((resolve, reject) => {
      this.db.ref(`userMonstersMeta/${monster.key}`).once('value', snap => {
        if (!snap.exists()) return resolve(false);

        resolve(JSON.parse(snap.val()));
      });
    });
  },
  fetchNames (path = 'name') {
    if (!this.db) throw new Error('No available connection. Have you forgot to connect()?');

    return new Promise((resolve, reject) => {
      this.db.ref(path).orderByValue().once('value', snap => {
        let data = [];

        snap.forEach(monster => {
          data.push({
            key: monster.key,
            name: monster.val()
          });
        });

        resolve(data);
      });
    });
  },
  fetchUserMonsters (uid) {
    return this.fetchNames(`userMonsters/${uid}`);
  },
  fetchUserSpells (uid) {
    return this.fetchNames(`userSpells/${uid}`);
  },
  fetchSpells () {
    if (!this.db) throw new Error('No available connection. Have you forgot to connect()?');

    return new Promise((resolve, reject) => {
      this.db.ref('spellnames').orderByValue().once('value', snap => {
        let data = [];

        snap.forEach(monster => {
          data.push({
            key: monster.key,
            name: monster.val()
          });
        });

        resolve(data);
      });
    });
  },
  saveGroup (user, players) {
    if (!user.state || !user.uid.length) return Promise.resolve();

    const ref = this.db.ref(`userGroups/${user.uid}`);
    if (!players.length) {
      ref.set(true);
      return Promise.resolve();
    }

    players.forEach(o => { o.info = ''; });
    let newPlayers = players.filter(o => o.saved === false);

    newPlayers.forEach(p => {
      let key = ref.push().key;
      p.uid = key;
      p.saved = true;
    });

    let updateObject = {};
    // get everythings updated in one batch
    players.forEach(p => {
      updateObject[p.uid] = p;
    });

    return ref.set(updateObject);
  },
  loadGroup (user) {
    if (!user.state || !user.uid.length) return Promise.resolve();

    return new Promise((resolve, reject) => {
      this.db.ref(`userGroups/${user.uid}`).once('value').then(snap => {
        let players = [];
        snap.forEach(child => { players.push(child.val()); });

        resolve(players);
      });
    });
  },
  getMonsterData (key) {
    if (cache.hasOwnProperty(key)) return Promise.resolve(cache[key]);

    if (!this.db) throw new Error('No available connection. Have you forgot to connect()?');

    return new Promise((resolve, reject) => {
      this.db.ref('monsters/' + key).once('value', snap => {
        // return empty object in case of fail
        if (!snap.exists()) return resolve({description: '', name: ''});

        let data = snap.val();
        resolve(data);
        cache[snap.key] = data;
      });
    });
  },
  getSpellData (key) {
    if (spellCache.hasOwnProperty(key)) return Promise.resolve(spellCache[key]);

    if (!this.db) throw new Error('No available connection. Have you forgot to connect()?');

    return new Promise((resolve, reject) => {
      this.db.ref('spells/' + key).once('value', snap => {
        // return empty object in case of fail
        if (!snap.exists()) return resolve({description: ''});

        let data = snap.val();
        resolve(data);
        spellCache[snap.key] = data;
      });
    });
  }
}
