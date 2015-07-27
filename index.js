var format = require('util').format;
var http = require("http");

var request = require('request');
var cheerio = require('cheerio');

var fs = require('fs');
var path = require('path');
var outputFilePath = '/output/inst.txt';

var inst_file_name_global = path.join(__dirname, outputFilePath);
fs.writeFile(inst_file_name_global, '' ,function (err) {
    if (err) return console.log(err);
});

var table_file_name_global = '/home/vit/tables.txt';
fs.writeFile(table_file_name_global, '' ,function (err) {
    if (err) return console.log(err);
});

var spec_file_name_global = '/home/vit/spec.txt';
fs.writeFile(spec_file_name_global, '' ,function (err) {
    if (err) return console.log(err);
});


var main_page_link = 'http://vstup.info';
//var main_page_link = 'http://vstup.info/2015/282/i2015i282p253531.html#list';


///////////////////////////////////////////////////////////////////////////////////////////////
var export_table = function(table_page$, page_link_param, inst_file_name) {
    table_page$('table').each(function (i, element) {
        var table_id = table_page$(this).attr('id');
        if (typeof table_id === typeof '' && table_id != 'shortstat' && table_id != 'legend') {

            var table_head = table_page$('#' + table_id + ' thead tr th').map(function (i, el) {
                var out_string = table_page$(this).text();
                //console.log(out_string);
                return out_string;
            });

            var len = table_head.length;
            //console.log(len);
            var arr = [];
            var one_person = '';

            var table_body = table_page$('#' + table_id + ' tbody tr td').each(function (i, el) {
                var cur = table_page$(this).text();

                if ((i + 1) % len == 0) {
                    //console.log(one_person+'\n');
                    arr.push('{ "page_link" : "' + page_link_param + '",' + one_person.substr(0, one_person.length - 1) + '}');
                    one_person = '';
                }


                var cur_name = table_head.get()[i % len];
                if (cur_name == 'ЗНО') {
                    var zno_name = cur_name;
                    var separate_array = '';
                    table_page$(this).children('nobr').contents().each(function (i, el) {
                        var ch_el = table_page$(this);
                        var title_attr = ch_el.attr('title');
                        var zno_val = ch_el.text().substr(0, ch_el.text().length - 1);
                        if (title_attr !== undefined) {
                            one_person = one_person + '"' + zno_name + " " + title_attr + '" : ' + zno_val + ',';
                            separate_array = separate_array + '"' + title_attr + '" : ' + zno_val + ',';
                        }
                    });
                    //console.log(separate_array.substr(0, separate_array.length - 1));
                    one_person = one_person + '"' + zno_name + '" : { ' + separate_array.substr(0, separate_array.length - 1) + ' } ,';
                }
                else if (cur_name == 'Σ' || cur_name == 'С') {
                    one_person = one_person + '"' + table_head.get()[i % len] + '" : ' + table_page$(this).text() + ',';
                }
                else if (cur_name != '#') {
                    one_person = one_person + '"' + table_head.get()[i % len] + '" : "' + table_page$(this).text() + '",';
                }


            });


            //console.log(arr);
            fs.appendFile(inst_file_name, arr.join(',\n') + ',\n',function (err) {
                if (err) return console.log(err);
                //if (arr != '') console.log(arr.join(',\n') + ', > ' + inst_file_name);
            });

        }
    });
//////////////////////////////////////////////////////////////////////////////////
}


request(main_page_link, function (error, response, html) {
    if (!error && response.statusCode == 200) {
        var main_page$ = cheerio.load(html);
        var table_page$ = main_page$;






        var once_done = false;
        main_page$('a').each(function (i, element) {
            var spec_page_link = main_page$(this).attr('href');
            if (typeof spec_page_link === typeof '' && spec_page_link.indexOf('/2015/i2015okr') > -1) {
                if (false == once_done) {
                    once_done = true;
                    console.log('loading: ' + spec_page_link);

                    request( main_page_link + spec_page_link, function (error, response, html) {
                        if (!error && response.statusCode == 200) {
                            var spec_page$ = cheerio.load(html);
                            var spec_once_done = 0;
                            spec_page$('a').each(function (i, element) {
                                var inst_page = spec_page$(this).attr('href');
                                if (typeof inst_page === typeof '' && inst_page.indexOf('./i2015') > -1) {
                                    if (2 > spec_once_done) {
                                        spec_once_done++;
                                        var full_inst_page_link = main_page_link + '/2015' + inst_page.substr(1);
                                        console.log('loading: #'+ i + " " + full_inst_page_link);

                                        //export_table(spec_page$, full_inst_page_link, spec_file_name_global);

                                        request(full_inst_page_link, function (error, response, html) {
                                            if (!error && response.statusCode == 200) {
                                                var inst_page$ = cheerio.load(html);
                                                var inst_once_done = 0;
                                                inst_page$('a').each(function (i, element) {
                                                    var table_link = inst_page$(this).attr('href');

                                                    if (typeof table_link === typeof '' && table_link.indexOf('i2015i') > -1) {
                                                        if (2 > inst_once_done) {
                                                            inst_once_done++;

                                                            var table_link_full = main_page_link + '/2015' + table_link.substr(1);
                                                            console.log('loading:#' + i + " "  + table_link_full);

                                                            export_table(inst_page$, table_link_full, inst_file_name_global);

                                                            request(table_link_full, function (error, response, html) {
                                                                if (!error && response.statusCode == 200) {
                                                                    var table_page$ = cheerio.load(html);

                                                                    export_table(table_page$, table_link_full, table_file_name_global);
                                                                    //export_table(table_page$, table_link_full);

                                                                    //table_page$('span.tablesaw-cell-content').each(function (i, element) {
                                                                    //    var table_cell = table_page$(this).text();
                                                                    //    console.log("hey: " + table_cell);
                                                                    //});
                                                                }
                                                            });



                                                        }
                                                    }
                                                });
                                            }
                                        });


                                    }


                                }
                            });
                        }
                    });

                }

            }

        });


    }
});
/*
 var server = http.createServer(function (request, response) {


 var options = {
 hostname: 'www.vstup.info',
 path: '/2015/174/i2015i174p212830.html#list',
 method: 'GET',
 headers: {
 'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.130 Safari/537.36'
 }
 };

 var req = http.get(options, function (res) {
 console.log('STATUS: ' + res.statusCode);
 console.log('HEADERS: ' + JSON.stringify(res.headers));
 res.setEncoding('utf8');
 res.on('data', function (chunk) {
 response.write(chunk);
 console.log('data');
 });
 res.on('end', function () {
 console.log('end');
 response.writeHead(200, {"Content-Type": "text/html"});
 response.end();
 })
 });

 });


 server.listen(80);
 console.log("Server is listening");
 */