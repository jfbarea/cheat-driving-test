require('dotenv').config();

const axios = require('axios').default;
const { parse } = require('node-html-parser');
const { BASE_URL: baseURL , COOKIE: Cookie} = process.env;
const api = axios.create({
  baseURL, 
  headers: { Cookie }
});

function getDataId (rawAttrs, attr='id') {
  const pattern = attr === 'id' ? /data-id="(\d*)"/ : /data-value="(\d*)"/;
  return rawAttrs.match(pattern)[1];
}


async function main () {
  const {headers, data} = await api.get('/realizar-test');
  const document = parse(data);
  const test = document.querySelector('div.test-item-container');
  const testId = getDataId(test.rawAttrs);

  const questions = test.querySelectorAll('div.test-item');
  const questionIds = questions.map(e => getDataId(e.rawAttrs));

  const answers = test.querySelectorAll('div.question-response');
  const answerIds = answers.map(e => getDataId(e.rawAttrs, 'data'));
  const orderedAnswerIds = answerIds.reduce((acc, cur, i) => {
    console.log(questionIds[i]);
  }, {});
  console.log(orderedAnswerIds);
}

main();
