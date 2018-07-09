const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors')({origin: true});
const sanitizeHtml = require('sanitize-html');
const app = express();

admin.initializeApp(functions.config().firebase);

function sanitize (obj) {
  return `<div class="m-t-10">
            <span class="f-w-b">${sanitizeHtml(obj.title.trim())}</span>
            <span class="m-l-10">${sanitizeHtml(obj.content.trim())}</span>
          </div>`;
}

function getMod (str) {
  if (!str.length) return '';

  let d = parseInt(str, 10);
  if (isNaN(d)) return 0;

  let mod = Math.floor((d - 10) / 2);
  return mod > 0 ? '+' + mod : mod;
}

String.prototype.nl2br = function () {
  return this.replace(/([^>])\n/g, '$1<br/>');
}

const authorize = (request, response, next) => {
  if (!request.get('authorization') || !request.get('authorization').startsWith('Bearer ')) {
      response.status(403).send('Unauthorized');
      return;
    }

    let token = request.get('authorization').split('Bearer ')[1];
    admin.auth().verifyIdToken(token)
    .then(decodedToken => {
      request.body['user'] = decodedToken; //complete user object
      next();
    })
    .catch(e => { response.status(403).send('User Validation failed'); })
    ;
}

const addMonster = (request, response) => {
  let monster = {};
  sanitizeHtml.defaults.allowedTags = [];
  sanitizeHtml.defaults.allowedAttributes = [];

  monster.name = sanitizeHtml(request.body.description.name.trim());
  monster.type = sanitizeHtml(request.body.description.type.trim());
  monster.ac = sanitizeHtml(request.body.description.ac.trim());
  monster.hits = sanitizeHtml(request.body.description.hits.trim());
  monster.speed = sanitizeHtml(request.body.description.speed.trim());
  let challenge = sanitizeHtml(request.body.description.challenge.trim());
  monster.ldescription = sanitizeHtml(request.body.description.ldescription.trim());

  monster.props = [];
  monster.sprops = [];
  monster.actions = [];
  monster.reactions = [];
  monster.lactions = [];
  monster.attr = {};

  ['str', 'dex', 'con', 'intel', 'wis', 'cha'].forEach(val => {
    if (request.body.description.attr[val] === undefined) return;

    let attr = sanitizeHtml(request.body.description.attr[val].trim());
    attr += ` (${getMod(attr)})`;
    monster['attr'][val] = attr;
  });

  monster.props = request.body.description.props.map(sanitize);
  monster.sprops = request.body.description.sprops.map(sanitize);
  monster.actions = request.body.description.actions.map(sanitize);
  monster.reactions = request.body.description.reactions.map(sanitize);
  monster.lactions = request.body.description.lactions.map(sanitize);

  monster.props.push(sanitize({content: challenge, title: 'Challenge:'}));

  if (!monster.name || !monster.hits || !monster.attr.dex) response.status(200).send({error: 'monster object is invalid'});

  let obj = {
    name: monster.name,
    hit: monster.hits,
    dex: sanitizeHtml(request.body.dex),
    xp: sanitizeHtml(request.body.xp)
  }

  let description = `<span class="f-s-24 f-w-b">${monster.name}</span>
      <div class="f-s-18 i f-w-b">${monster.type}</div>
      <div><span class="f-w-b">Armor Class:</span><span class="m-l-10">${monster.ac}</span></div>
      <div><span class="f-w-b">Hit Points:</span><span class="m-l-10">${monster.hits}</span></div>
      <div><span class="f-w-b">Speed:</span><span class="m-l-10">${monster.speed}</span></div>
      <div class="attributes">
        <div class="t-a-c p-5"><div class="f-w-b f-s-14">STR</div><div>${monster.attr.str}</div></div>
        <div class="t-a-c p-5"><div class="f-w-b f-s-14">DEX</div><div>${monster.attr.dex}</div></div>
        <div class="t-a-c p-5"><div class="f-w-b f-s-14">CON</div><div>${monster.attr.con}</div></div>
        <div class="t-a-c p-5"><div class="f-w-b f-s-14">INT</div><div>${monster.attr.intel}</div></div>
        <div class="t-a-c p-5"><div class="f-w-b f-s-14">WIS</div><div>${monster.attr.wis}</div></div>
        <div class="t-a-c p-5"><div class="f-w-b f-s-14">CHA</div><div>${monster.attr.cha}</div></div>
      </div>`;

    description += monster.props.join('');
    if (monster.sprops.length) description += `<div class="m-t-20">
        ${monster.sprops.join('').nl2br()}</div>`;
    if (monster.actions.length) description += `<div class="m-t-20">
        <div class="i f-w-b f-s-18">Actions</div>${monster.actions.join('').nl2br()}</div>`;
    if (monster.reactions.length) description += `<div class="m-t-20">
        <div class="i f-w-b f-s-18">Reactions</div>${monster.reactions.join('').nl2br()}</div>`;
    let lactions = monster.lactions.join('').nl2br();
    if (lactions) description += `<div class="m-t-20">
        <div class="i f-w-b f-s-18">Legendary Actions</div>
      <div>${monster.ldescription}</div>
      ${lactions}</div>`;

    obj.description = description;

  let ref = admin.database().ref();
  let key = ref.child(`userMonsters/${request.body.user.uid}`).push(obj.name).key;

  ref.child('monsters').update({[key]: obj});

  response.status(200).send({key, name: obj.name});
}

const addSpell = (request, response) => {
  let spellHtml;

  sanitizeHtml.defaults.allowedTags = [];
  sanitizeHtml.defaults.allowedAttributes = [];

  const name = sanitizeHtml(request.body.name.trim());
  const type = sanitizeHtml(request.body.type.trim());
  const time = sanitizeHtml(request.body.time.trim());
  const range = sanitizeHtml(request.body.range.trim());
  const duration = sanitizeHtml(request.body.duration.trim());
  const components = sanitizeHtml(request.body.components.trim());

  spellHtml = `<div class="p-b-20">
                 <span class="f-s-24 f-w-b">${name}</span>
                 <div class="i f-w-b f-s-18">${type}</div>
                </div>`;

  let props = {time, range, duration, components};
  for (let prop in props) {
    spellHtml += `<div class="m-t-10">
            <span class="f-w-b">${prop.charAt(0).toUpperCase()}${prop.slice(1)}:</span>
            <span class="m-l-10">${props[prop]}</span>
          </div>`;
  }

  spellHtml += request.body.ps.map(paragraph => {
    return `<div class="m-t-10">
              <p>${paragraph.content}</p>
            </div>`;
  }).join('');

  let ref = admin.database().ref();
  let key = ref.child(`userSpells/${request.body.user.uid}`).push(name).key;

  ref.child('spells').update({[key]: {name, description: spellHtml}});

  response.status(200).send({key, name});
}

app.use(cors);
app.use(authorize);
app.post('/monster', addMonster);
app.post('/spell', addSpell)

exports.app = functions.https.onRequest(app);
