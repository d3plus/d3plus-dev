const shell = require("shelljs");
const {name} = JSON.parse(shell.cat("package.json"));

exports.currentDate = () => new Date().toUTCString();

exports.codeLink = meta => {
  const {filename, lineno, path} = meta;
  let folders = path.split("/");
  const index = folders.indexOf(name);
  folders = folders.slice(index + 1);
  return `[<>](https://github.com/d3plus/${name}/blob/master${ folders.length ? `/${folders.join("/")}` : "" }/${filename}#L${lineno})`;
};

/* a helper to execute javascript expressions
 USAGE:
 -- Yes you NEED to properly escape the string literals or just alternate single and double quotes
 -- to access any global function or property you should use window.functionName() instead of just functionName(), notice how I had to use window.parseInt() instead of parseInt()
 -- this example assumes you passed this context to your handlebars template( {name: 'Sam', age: '20' } )
 <p>Url: {{x " \"hi\" + name + \", \" + window.location.href + \" <---- this is your href,\" + " your Age is:" + window.parseInt(this.age, 10) "}}</p>
 OUTPUT:
 <p>Url: hi Sam, http://example.com <---- this is your href, your Age is: 20</p>
*/
exports.x = expression => {

  try {
    return eval(expression);
  }
  catch (e) {
    console.warn(`•Expression: {{x '${expression}'}}\n•JS-Error: ${e}\n•Context: ${this}`);
    return undefined;
  }

};

// for detailed comments and demo, see my SO answer here http://stackoverflow.com/questions/8853396/logical-operator-in-a-handlebars-js-if-conditional/21915381#21915381

/* a helper to execute an IF statement with any expression
  USAGE:
 -- Yes you NEED to properly escape the string literals, or just alternate single and double quotes
 -- to access any global function or property you should use window.functionName() instead of just functionName()
 -- this example assumes you passed this context to your handlebars template( {name: 'Sam', age: '20' } ), notice age is a string, just for so I can demo parseInt later
 <p>
   {{#xif " name == 'Sam' && age === '12' " }}
     BOOM
   {{else}}
     BAMM
   {{/xif}}
 </p>
 */
exports.xif =  (expression, options) => exports.x.apply(this, [expression, options]) ? options.fn(this) : options.inverse(this);
