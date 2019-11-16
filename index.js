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

function getToken (html) {
  const pattern =  /token = "([A-Za-z0-9]*)"/
  return html.match(pattern)[1];
}

function answerQuestion(testId, _token, questionId, selectedResponse){
  return api.post('check-questions', {
    testId,
    _token,
    questions: [{
      questionId,
      selectedResponse,
      selectedKnowledge: 'S',
    }]
  });
}

async function main () {
  const { headers, data: HTMLString } = await api.get('/realizar-test');
  const document = parse(HTMLString);
  const test = document.querySelector('div.test-item-container');
  const testId = getDataId(test.rawAttrs);

  const questions = test.querySelectorAll('div.test-item');
  const questionIds = questions.map(e => getDataId(e.rawAttrs));

  const answers = test.querySelectorAll('div.question-response');
  const answerIds = answers.map(e => getDataId(e.rawAttrs, 'data'))
    .filter((id, index) => index % 3 ===0);
  const token = getToken(HTMLString);
  console.log(answerIds.length);
  console.log(headers);
  console.log(token);
  const postResponse = await Promise.all(questionIds.map((questionId, index) => {
    return answerQuestion(testId, token, questionId, answerIds[index]);
  }));
  console.log('POST RESPONSE', postResponse);
}

main();
