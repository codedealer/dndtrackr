/*
  gets a string with arbitrary filters and parses it
  filter syntax is assumed to be {symbol}{query}
  e.g. #foo :lbar normal words
*/
class QueryParser {
  constructor () {
    this.syntaxMap = new Map();
    this.defaultOptions = {
      fullSearch: false,
      msg: '',
      intSearch: false,
    }
    this.intCompareOperators = new Map([
      ['eq', (a, b) => a === b],
      ['gt', (a, b) => a > b],
      ['lt', (a, b) => a < b],
    ]);
  }
  add (symbol, property, options = {}) {
    const o = Object.assign({ property }, this.defaultOptions, options);
    this.syntaxMap.set(symbol, o);

    return this;
  }
  getQueryParameters (query) {
    const params = new Map();
    query.split(' ')
         .forEach(chunk => {
            for (let [symbol, value] of this.syntaxMap) {
              if (chunk.startsWith(symbol)) {
                let q = chunk.split(symbol);
                if (q.length < 2 || q[1].length < 1) continue;

                params.set(value.property, {
                  value: q[1],
                  ...value,
                });

                break;
              }
            }
         });

    return params;
  }
  getFilteredValue (query) {
    query = query.split(' ')
         .filter(chunk => {
            for (let [symbol, value] of this.syntaxMap) {
              if (chunk.startsWith(symbol)) return false; // this is a query
            }

            return true;
         })
         .join(' ');

    return query;
  }
  checkString (str, searchObj) {
    if (typeof str !== 'string') return false;

    if (!searchObj.fullSearch) {
      return str.toLowerCase().startsWith(searchObj.value.toLowerCase());
    }

    return str.toLowerCase().indexOf(searchObj.value.toLowerCase()) >= 0;
  }
  compare (val, searchObj) {
    if (!searchObj.intSearch || !this.intCompareOperators.has(searchObj.intSearch)) {
      return this.checkString(val, searchObj);
    }

    let a = parseInt(val);
    if (isNaN(a)) return false;
    let b = parseInt(searchObj.value);
    if (isNaN(b)) return false;
    return this.intCompareOperators.get(searchObj.intSearch)(a, b);
  }
  filter (list, params) {
    if (params.size === 0) return list;

    list = list.filter(item => {
      let consensus = true;

      for (let [property, searchObj] of params) {
        if ({}.hasOwnProperty.call(item, property) === false) {
          consensus = false;
          break;
        }

        if (Array.isArray(item[property])) {
          consensus = item[property].find(s => this.compare(s, searchObj)) !== undefined;
        } else if (typeof item[property] === 'object') {
          consensus = Object.keys(item[property]).find(s => this.compare(s, searchObj)) !== undefined;
        } else {
          consensus = this.compare(item[property], searchObj);
        }

        if (!consensus) break;
      }

      return consensus;
    });

    return list;
  }
}

export default QueryParser;