import { Joy } from "./engine"

// load joy primitives into and instance of the engine
export function loadCoreLibrary(j: Joy) {

    // core
    j.execute('[ [ ] ifte ]                           "when"         define')
    j.execute('[ [ ] swap ifte ]                      "unless"       define')
    j.execute('[ [dup] dip ]                          "dupd"         define')
    j.execute('[ [true] swap when ]                   "apply"        define')
    j.execute('[ [keep] dip apply ]                   "cleave"       define')
    j.execute('[ [swap] dip ]                         "swapd"        define')
    j.execute('[ 0 swap - ]                           "neg"          define')
    j.execute('[ dup 0  [<] [neg] when ]              "abs"          define')
    j.execute('[ dupd dip ]                           "keep"         define')
    j.execute('[ pop pop ]                            "pop2"         define')
    j.execute('[ pop pop pop ]                        "pop3"         define')
    j.execute('[ swapd swap ]                         "rolldown"     define')
    j.execute('[ rolldown rolldown ]                  "rollup"       define')
    j.execute('[ [list] rollup ifte ]                 "iflist"       define')
    j.execute('[ snoc pop ]                           "first"        define')
    j.execute('[ snoc swap pop ]                      "rest"         define')
    j.execute('[ dup first swap rest]                 "uncons"       define')
    j.execute('[ uncons swap ]                        "unswons"      define')
    j.execute('[ swap cons ]                          "swons"        define')
    j.execute('[ [pop] dip ]                          "popd"         define')
    j.execute('[ [swons] step ]                       "shunt"        define')
    j.execute('[ [empty] [""] iflist swap shunt ]     "reverse"      define')

    // joy inilib
    j.execute('[ \"\n\" putch ]                                     "newline"    define')
    j.execute('[ put newline ]                                      "putln"      define')
    j.execute('[ \" \" putch ]                                      "space"      define')
    j.execute('[ [putch] step ]                                     "putchars"   define')
    j.execute('[ [putchars] step ]                                  "putstrings" define')
    j.execute('[ dupd dup swapd  ]                                  "dup2"       define')
    j.execute('[ [pop true] swap ifte ]                             "sequor"     define')
    j.execute('[ [pop false] ifte ]                                 "sequand"    define')
    j.execute('[  [dip] cons dip ]                                  "dipd"       define')
    j.execute('[  [dip] cons dip ]                                  "dip2"       define')
    j.execute('[ [dip2] cons dip ]                                  "dip3"       define')
    j.execute('[ [] unstack ]                                       "newstack"   define')
    j.execute('[ true ]                                             "truth"      define')
    j.execute('[ false ]                                            "falsity"    define')
    j.execute('[ [dup "a" >=] [32 -] [ ] ifte ]                     "to-upper"   define')
    j.execute('[ [dup "a" < ] [32 +] [ ] ifte ]                     "to-lower"   define')
    j.execute('[ swap concat ]                                      "swoncat"    define')
    j.execute(`[ "Monday" "Tuesday" "Wednesday" "Thursday"          
                 "Friday" "Saturday" "Sunday" ]                     "weekdays"   define`)
    j.execute(`[ "JAN" "FEB" "MAR" "APR" "MAY" "JUN"         
                 "JUL" "AUG" "SEP" "OCT" "NOV" "DEC" ]              "months"     define`)
    j.execute('[ [[false] ifte] cons cons ]                         "conjoin"    define')
    j.execute('[ [ifte] cons [true] swons cons ]                    "disjoin"    define')
    j.execute('[ [[false] [true] ifte] cons ]                       "negate"     define')
    j.execute('[ apply ]                                            "i"          define')
    j.execute('[ dup apply ]                                        "x"          define')
    j.execute('[ [ ] cons i ]                                       "call"       define')
    j.execute(`[ swap [=] cons filter size [1 >=] 
                 [true] [false] ifte empty cons unstack]            "in"         define`)

    // j.execute('[  ]                      ""      define')
    // j.execute('[  ]                      ""      define')
    // j.execute('[  ]                      ""      define')
    // j.execute('[  ]                      ""      define')
    // j.execute('[  ]                      ""      define')
    // j.execute('[  ]                      ""      define')
    // j.execute('[  ]                      ""      define')
    // j.execute('[  ]                      ""      define')




    /* eliminated
      j.execute('[ [ 2dip ] 2dip [ dip ] dip apply ]    "tri*"      define');
      j.execute('[ [ 2dip ] dip apply ]                 "2cleave*"  define');
      j.execute('[ [ 2dup ] dip 2dip ]                  "2keep"     define');
      j.execute('[ [ 2keep ] 2dip [ 2keep ] dip apply ] "2tri"      define');
      j.execute('[ [ 2keep ] dip apply ]                "2cleave"   define');
      j.execute('[ [ 3dup ] dip 3dip ]                  "3keep"     define');
      j.execute('[ [ 3keep ] 2dip [ 3keep ] dip apply ] "3tri"      define');
      j.execute('[ [ 3keep ] dip apply ]                "3cleave"   define');
      j.execute('[ [ 4dip ] 2dip [ 2dip ] dip apply ]   "2tri*"     define');
      j.execute('[ [ dip ] dip apply ]                  "cleave*"   define');
      j.execute('[ [ dup ] dip swap ]                   "over"      define');
      j.execute('[ [ keep ] 2dip [ keep ] dip apply ]   "tri"       define');
      j.execute('[ [ over ] dip swap ]                  "pick"      define');
      j.execute('[ [ pop2 ] dip ]                       "2nip"      define');
      j.execute('[ [ sum ] [ size ] cleave / ]          "average"   define');
      j.execute('[ 0 [ + ] fold ]                       "sum"       define');
      j.execute('[ 1 [ * ] fold ]                       "prod"      define');
      j.execute('[ 1 range prod ]                       "factorial" define');
      j.execute('[ cleave@ and ]                        "both?"     define');
      j.execute('[ cleave@ or ]                         "either?"   define');
      j.execute('[ dup * ]                              "square"    define');
      j.execute('[ dup 2dip apply ]                     "cleave@"   define');
      j.execute('[ dup 3dip apply ]                     "2cleave@"  define');
      j.execute('[ dup 3dip dup 2dip apply ]            "tri@"      define');
      j.execute('[ dup 4dip apply ]                     "2tri@"     define');
      j.execute('[ over over ]                          "2dup"      define');
      j.execute('[ pick pick pick ]                     "3dup"      define');
      j.execute('[ swap [ 2dip ] dip ]                  "3dip"      define');
      j.execute('[ swap [ 3dip ] dip ]                  "4dip"      define');
      j.execute('[ swap [ dip ] dip ]                   "2dip"      define');
      j.execute('[ swap pop ]                           "nip"       define');
      */

    $(document).ready(function () {
        console.debug('document ready');
        var joyStrs = contentProviderCallback();
        j.processJoySource(joyStrs);
        $("#dropdown-search").empty();
        var defs = j.getDefines();
        console.debug('populating dictionary dropdown');
        for (var i = 0; i < defs.length; i++) {
            const key: string = defs[i].trim().slice(0, defs[i].indexOf('=='))
            const value = defs[i].trim()
            $("#dropdown-dictionary").append(`<a class=\"drop-element\" href=\"#${key}\"> ${value} </a>`);
        }
    });

} // loadCoreLibries

function contentProviderCallback() {
    console.debug('executing content provider callback');
    /* Note: getJoyFileString is a script function within the vscode content provider.
       Function eval is called to avoid 'getJoyFileString()' not defined typescript error and to validate */
    const joyFileStrings = eval('getJoyFileStrings()')
    return joyFileStrings
}