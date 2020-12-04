# crawl-keyword

1. This is a crawler which aceepts a url to begin with & crawls upto MAX_DEPTH to find keywords searched.
2. It uses node-fetch library for fetching website data & convert it to string using res.text();
3. It is a recursive call to crawl.
4. crawlWebsiteWithKeyword is the init function.
5. Currently it is crawling all the links found with complete url.
6. The code for adding urls with relative path is commented out for now but works perfectly fine. Can be checked with https://apple.com & apple keyword
7. We use visitedMap to keep a set of already visited Urls. (this is redundant now as we can just use resultMap itself)
8. resultMap keeps the track of all url to results.
9. The size of resultMap gives us actual pages which had keyword found in it.
10. console.log for total pages crawled and total matches is put at end to give clarity to the user.
