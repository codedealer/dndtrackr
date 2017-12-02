import firebase from 'firebase'
import firebaseui from 'firebaseui'
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
        signInSuccess () { return false }
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
      } else {
        userState.state = 0;
      }
    })

    this.db = firebase.database(app);
    this.app = app;
  },
  signOut () {
    firebase.auth(this.app).signOut();
  },
  addMonster (user, monster) {
    let url = 'https://us-central1-dndtrackr.cloudfunctions.net/app/sanitize';

    return new Promise((resolve, reject) => {
      firebase.auth(this.app).currentUser.getIdToken().then(token => {
        axios.post(url, JSON.stringify(monster), {headers: {'Authorization': 'Bearer ' + token}})
          .then(response => {
            if (response.data.error) {
              console.error(response.data.error);
              return;
            }
            if (!response.data.key) return;

            user.monsters.push({
              key: response.data.key,
              name: response.data.name
            });
            resolve();
          })
          .catch(e => { console.error(e); resolve(); })
          ;
      });
    });
  },
  removeMonster (monster) {
    let uid = firebase.auth(this.app).currentUser.uid;
    let updateObject = {};

    updateObject[`monsters/${monster.key}`] = null;
    updateObject[`userMonsters/${uid}/${monster.key}`] = null;

    this.db.ref().update(updateObject);
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
