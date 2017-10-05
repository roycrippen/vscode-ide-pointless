import { Joy } from "./engine"

// load joy primitives into and instance of the engine
export function loadCoreLibries(j: Joy) {

  // core
  j.execute('[ [ ] ifte ]                           "when"      define')
  j.execute('[ [ ] swap ifte ]                      "unless"    define')
  j.execute('[ [ dup ] dip ]                        "dupd"      define')
  j.execute('[ [ keep ] dip apply ]                 "cleave"    define')
  j.execute('[ [ swap ] dip ]                       "swapd"     define')
  j.execute('[ [ true ] swap when ]                 "apply"     define')
  j.execute('[ 0 swap - ]                           "neg"       define')
  j.execute('[ dup 0 < [ neg ] when ]               "abs"       define')
  j.execute('[ dupd dip ]                           "keep"      define')
  j.execute('[ pop pop ]                            "pop2"      define')
  j.execute('[ pop pop pop ]                        "pop3"      define')
  j.execute('[ rolldown rolldown ]                  "rollup"    define')
  j.execute('[ swapd swap ]                         "rolldown"  define')

  // added for joy compatibility
  j.execute('[ swap cons ]                          "swons"     define')
  j.execute('[ [pop] dip ]                          "popd"      define')
  j.execute('[ snoc pop ]                           "first"     define')
  j.execute('[ snoc swap pop ]                      "rest"      define')

  // from joy proper libraries, added for testing
  j.execute('[ [ dup "a" >= ] [ 32 - ] [ ] ifte ]      "to-upper"             define')
  j.execute('[ [ dup "a" < ]  [ 32 + ] [ ] ifte ]      "to-lower"             define')
  // j.execute('[ "Monday" "Tuesday" "Wednesday" "Thursday" "Friday" "Saturday" "Sunday" ] "weekdays" define')

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
    var joyStr = contentProviderCallback();
    j.processJoySource(joyStr);
    $("#dropdown-search").empty();
    var defs = j.getDefines();
    console.debug('populating dictionary dropdown');
    for (var _i = 0, _a = Object.entries(defs); _i < _a.length; _i++) {
      var _b = _a[_i], k = _b[0], v = _b[1];
      $("#dropdown-dictionary").append("<a class=\"drop-element\" href=\"#" + k + "\">" + k + " == " + v + "</a>");
    }
  });

} // loadCoreLibries

var getJoyFileString: any;

function contentProviderCallback() {
  console.debug('executing content provider callback');
  //Note: getJoyFileString is a script function within the vscode content provider 
  return getJoyFileString();
}