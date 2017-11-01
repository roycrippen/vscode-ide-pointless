import { Joy } from "./engine"

// load joy primitives into and instance of the engine
export function loadCoreLibrary(j: Joy) {

    // core
    j.execute('[ dup dip ]                                                        "x"                define')
    j.execute('[ x pop ]                                                          "i"                define')
    j.execute('[ [ ] ifte ]                                                       "when"             define')
    j.execute('[ [ ] swap ifte ]                                                  "unless"           define')
    j.execute('[ [dup] dip ]                                                      "dupd"             define')
    j.execute('[ [swap] dip ]                                                     "swapd"            define')
    j.execute('[ 0 swap - ]                                                       "neg"              define')
    j.execute('[ dup 0  [<] [neg] when ]                                          "abs"              define')
    j.execute('[ dupd dip ]                                                       "keep"             define')
    j.execute('[ pop pop ]                                                        "pop2"             define')
    j.execute('[ pop pop pop ]                                                    "pop3"             define')
    j.execute('[ swapd swap ]                                                     "rolldown"         define')
    j.execute('[ rolldown rolldown ]                                              "rollup"           define')
    j.execute('[ [list] rollup ifte ]                                             "iflist"           define')
    j.execute('[ snoc pop ]                                                       "first"            define')
    j.execute('[ snoc swap pop ]                                                  "rest"             define')
    j.execute('[ dup first swap rest]                                             "uncons"           define')
    j.execute('[ uncons swap ]                                                    "unswons"          define')
    j.execute('[ swap cons ]                                                      "swons"            define')
    j.execute('[ [pop] dip ]                                                      "popd"             define')
    j.execute('[ [swons] step ]                                                   "shunt"            define')
    j.execute('[ [[]] [""] iflist swap shunt ]                                    "reverse"          define')
    j.execute('[  0 [+] fold ]                                                    "sum"              define')
    j.execute('[  1 [*] fold ]                                                    "prod"             define')
    j.execute('[  [pop 1] map sum ]                                               "size"             define')

    // joy inilib
    j.execute('[ \"\n\" putch ]                                                   "newline"          define')
    j.execute('[ put newline ]                                                    "putln"            define')
    j.execute('[ \" \" putch ]                                                    "space"            define')
    j.execute('[ [putch] step ]                                                   "putchars"         define')
    j.execute('[ [putchars] step ]                                                "putstrings"       define')
    j.execute('[ dupd dup swapd  ]                                                "dup2"             define')
    j.execute('[ [pop true] swap ifte ]                                           "sequor"           define')
    j.execute('[ [pop false] ifte ]                                               "sequand"          define')
    j.execute('[ [dip] cons dip ]                                                 "dipd"             define')
    j.execute('[ [dip] cons dip ]                                                 "dip2"             define')
    j.execute('[ [dip2] cons dip ]                                                "dip3"             define')
    j.execute('[ [dup] dip2 swap dip2 i ]                                         "cleave"           define')
    j.execute('[ [] unstack ]                                                     "newstack"         define')
    j.execute('[ true ]                                                           "truth"            define')
    j.execute('[ false ]                                                          "falsity"          define')
    j.execute('[ ["a" >=] [32 -] [ ] ifte ]                                       "to-upper"         define')
    j.execute('[ ["a" < ] [32 +] [ ] ifte ]                                       "to-lower"         define')
    j.execute('[ swap concat ]                                                    "swoncat"          define')
    j.execute('[ [[false] ifte] cons cons ]                                       "conjoin"          define')
    j.execute('[ [ifte] cons [true] swons cons ]                                  "disjoin"          define')
    j.execute('[ [[false] [true] ifte] cons ]                                     "negate"           define')
    j.execute('[ [] cons i ]                                                      "call"             define')
    j.execute(`[ swap [=] cons filter size [1 >=] [true] [false] ifte swap pop ]  "in"               define`)
    j.execute('[ stack [i] dip cons unstack [pop2] dip ]                          "unary"            define')
    j.execute('[ stack [i] dip cons unstack swap pop ]                            "nullary"          define')
    j.execute('[ [unary] cons dup [dip] dip i ]                                   "unary2"           define')
    j.execute('[ [pop] [[1 -] dip dup dip2 times] [pop2] ifte ]                   "times"            define')
    j.execute('[ [rest] times ]                                                   "drop"             define')
    j.execute(`[ "Monday" "Tuesday" "Wednesday" "Thursday" 
                 "Friday" "Saturday" "Sunday" ]                                   "weekdays"         define`)
    j.execute(`[ "JAN" "FEB" "MAR" "APR" "MAY" "JUN"         
                 "JUL" "AUG" "SEP" "OCT" "NOV" "DEC" ]                            "months"           define`)

    // agglib
    j.execute('[ "" cons ]                                                        "unitstring"       define')
    j.execute('[ [] cons ]                                                        "unitlist"         define')
    j.execute('[ "" cons cons ]                                                   "pairstring"       define')
    j.execute('[ [] cons cons ]                                                   "pairlist"         define')
    j.execute('[ uncons uncons pop ]                                              "unpair"           define')
    j.execute('[ rest first ]                                                     "second"           define')
    j.execute('[ rest rest first ]                                                "third"            define')
    j.execute('[ 3 drop first ]                                                   "fourth"           define')
    j.execute('[ 4 drop first ]                                                   "fifth"            define')
    j.execute('[ [null] dip ]                                                     "nulld"            define')
    j.execute('[ [cons] dip ]                                                     "consd"            define')
    j.execute('[ [swons] dip ]                                                    "swonsd"           define')
    j.execute('[ [uncons] dip ]                                                   "unconsd"          define')
    j.execute('[ [unswons] dip ]                                                  "unswonsd"         define')
    j.execute('[ [first] dip ]                                                    "firstd"           define')
    j.execute('[ [rest] dip ]                                                     "restd"            define')
    j.execute('[ [second] dip ]                                                   "secondd"          define')
    j.execute('[ [third] dip ]                                                    "thirdd"           define')
    j.execute('[ nulld null or ]                                                  "null2"            define')
    j.execute('[ swapd cons consd ]                                               "cons2"            define')
    j.execute('[ unconsd uncons swapd ]                                           "uncons2"          define')
    j.execute('[ swapd swons swonsd ]                                             "swons2"           define')
    j.execute('[ [unswons] dip unswons swapd ]                                    "unswons2"         define')
    j.execute('[ [null2] [pop2 []] [uncons2] [[pairlist] dip cons] linrec ]       "zip"              define')
    j.execute('[ 1 + ]                                                            "succ"             define')
    j.execute('[ 1 - ]                                                            "pred"             define')
    j.execute(`[ [] cons [pop pop] swoncat 
                 [>] swap [[dup succ] dip ] 
                 [cons] 
                 linrec ]                                                         "from-to"          define`)
    j.execute('[ [] from-to ]                                                     "from-to-list"     define')
    j.execute('[ "" from-to ]                                                     "from-to-string"   define')
    j.execute('[ dup2 filter rollup [ not ] concat filter ]                       "split"            define')
    j.execute('[ [dupd] swoncat [step pop] cons cons step ]                       "pairstep"         define')
    j.execute('[ [[null] [] [uncons]] dip [dip cons] cons linrec                  "mapr"             define')
    j.execute('[ [ [[null] ] dip [] cons [pop] swoncat [uncons]] dip linrec ]     "foldr"            define')
    j.execute('[ [] linrec ]                                                      "tailrec"          define')
    j.execute(`[ [[null2] [pop pop]] dip 
                 [dip] cons [dip] cons [uncons2] swoncat 
                 tailrec ]                                                        "stepr2"           define`)
    j.execute(`[ [[null2] [pop2 []] [uncons2]] dip
                 [dip cons] cons
                 linrec ]                                                         "mapr2"            define`)
    j.execute(`[ [[ [null2] ] dip
                 [] cons [pop2] swoncat
                 [uncons2] ] dip linrec ]                                         "foldr2"           define`)
    j.execute('[ [cons cons] foldr2 ]                                             "interleave2"      define')
    j.execute('[ [] interleave2 ]                                                 "interleave2list"  define')
    j.execute('[ [ sum ] [ size ] cleave / ]                                      "average"          define');
    j.execute(`[ 0.0 swap dup [sum] [size] cleave dup	
	             [ / [ - dup * + ] cons step ] dip pred / ]                       "variance"         define`)
    // j.execute('[  ]                      ""      define')
    // j.execute('[  ]                      ""      define')
    // j.execute('[  ]                      ""      define')
    // j.execute('[  ]                      ""      define')
    // j.execute('[  ]                      ""      define')
    // j.execute('[  ]                      ""      define')
    // j.execute('[  ]                      ""      define')

    // joy numlib
    j.execute('[ 0 > ]                                                            "positive"     define')
    j.execute('[ 0 < ]                                                            "negative"     define')
    j.execute('[ 2 rem null ]                                                     "even"         define')
    j.execute('[ even not ]                                                       "odd"          define')

    j.execute(`[ [ numerical ]
                 [ ]
                 [ unswons [ [calc] map uncons first ] dip call ]
                 ifte ]                                                           "calc" define`)

    // this one below fails 'in' tries to execute = - * / rather than test for it 
    // j.execute(` 
    // [ 
    //     [ numerical ]
    //     [ ]
    //     [ unswons
    //         [ dup [+ - * /] in ]
    //         [ [ [calc] map uncons first ] dip
    //             call ]
    //         [ "bad operator\n" put ]
    //         ifte ]
    //     ifte
    // ] "calc" define`)

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
            // $("#dropdown-dictionary").append($('<option>', { value: key, text: value }))
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