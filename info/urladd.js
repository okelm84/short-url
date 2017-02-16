var myurl = window.location.href;
document.getElementById('examplein').innerHTML = myurl+"new/https://www.foo.com/";
document.getElementById('exampleout').innerHTML = "{\"original_url\":\"https://www.foo.com/\", \"short_url\":\""+myurl+"1234\"}";
