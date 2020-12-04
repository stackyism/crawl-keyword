const fetch = require('node-fetch');

const hrefExp = new RegExp('href="\\S*"', 'g');
const urlExp = new RegExp('"\\S*"', 'i');
const visitedMap = new Map();
const MAX_DEPTH = 1;

const fetchPage = url => fetch(url).then(res => res.text());


const getNewUrls = (hrefs, url) => {
  const newUrls = new Set();
  const midFix = url[url.length-1] !== '/' ? '/' : '';
  hrefs.map(href => href.match(urlExp)[0].slice(1, -1)).forEach(result => {
    if(result[0] === '/'){
      newUrls.add(`${url}${midFix}${result.slice(1)}`);
    } else if(result[0] === '#'){
      //do nothing
    } else{
      if(result !== url){
        newUrls.add(result);
      }
    }
  })
  return newUrls;
}

const getResults = (data, keyword) => {
  const keywordExp = new RegExp(keyword, 'g');
  const dataLength = data.length;
  const keywordLength = keyword.length;
  let result, indices = [];
  while ( (result = keywordExp.exec(data)) ) {
    indices.push(result.index);
  }
  return indices.map(index => data.slice(Math.max(index - 5, 0), Math.min(index + keywordLength + 5, dataLength)));
}

const crawl = async (url, keyword, resultMap, depth) => {
  if(visitedMap.has(url)){
    const res = visitedMap.get(url);
    if(res.length){
      return [{url, results : visitedMap.get(url)}];
    }
    // return [{url, results : visitedMap.get(url)}];
    return undefined;
  }
  let data;
  try {
    data  = await fetchPage(url);
  } catch(e){
    data = '';
  }
  const hrefs = data.match(hrefExp);
  const newUrls = hrefs && hrefs.length ? getNewUrls(hrefs, url) : new Set();
  const currentResults = getResults(data, keyword);
  visitedMap.set(url, currentResults);

  if(depth === MAX_DEPTH){
    if(currentResults.length){
      return [{url, results : currentResults}];
    } else {
      return undefined;
    }
  }

  const newUrlsFetches = Array.from(newUrls).map(newUrl => crawl(newUrl, keyword, resultMap, depth + 1));
  const nestedData = await Promise.all(newUrlsFetches);
  const consumeData = nestedData.reduce((acc, datum) => {
    if(datum){
      datum.forEach(miniData => {
        if(miniData.results.length){
          resultMap.set(miniData.url, miniData.results);
          acc.push(miniData);
        }
      });
    }
    return acc;
  }, []);
  return [{url, results : currentResults}, ...consumeData];
};

const crawlWebsiteWithKeyword = async () => {
  const resultMap = new Map();
  await crawl('http://stakhi.in:3000/', 'Saagar', resultMap, 0);


  let count = 0;
  for (let value of resultMap.values()) {
    count = count + value.length;
  }

  for (let [url, results] of resultMap.entries()) {
    console.log(url + ' ==> ' + results.join(', '))
  }
  console.log(`Crawled ${resultMap.size} pages. Found ${count} matches`);
}

crawlWebsiteWithKeyword();

