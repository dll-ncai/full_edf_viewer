//Position parameters used for drawing the rectangle


var canvas = document.createElement('canvas'); //Create a canvas element
//Set canvas width/height
canvas.style.width='100%';
canvas.style.height='100%';
//Set canvas drawing area width/height
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
//Position canvas
canvas.style.position='absolute';
canvas.style.left=0;
canvas.style.top=0;
canvas.style.zIndex=100000;
div = document.getElementById('mycont')
canvas.style.pointerEvents='none'; //Make sure you can click 'through' the canvas
document.body.appendChild(canvas); //Append canvas to body element

var ctx = canvas.getContext('2d');
//Draw rectangle

var last_mousex = last_mousey = 0;
var mousex = mousey = 0;
var mousedown = false;

var csv_ar = [["Gender","Age","File Start","Start time","End time","Channel names","Comment"]];
var csv_rows = 1;
var csv_cols =3;
var com = "No comment";
var chArr = [];
var myStart = "";

// === Dropdown modal for comment selection ===
const ABNORMALITY_OPTIONS = [
    "No Comment",
    "Sharp Wave",
    "Spike and Wave",
    "Delta Slow Wave",
    "Theta Wave",
    "Delta and Theta Wave",
    "Polyspike",
    "Spike Wave and Polyspike Wave",
    "Low Voltage or No Waveform",
    "Artifacts",
    "Other"
];

function ensureCommentModal() {
    if (document.getElementById("commentModal")) return;

    const modal = document.createElement("div");
    modal.id = "commentModal";
    modal.style.cssText = `
    display:none; position:fixed; inset:0;
    background: rgba(0,0,0,0.4); z-index:100002;
  `;

    const box = document.createElement("div");
    box.style.cssText = `
    background:#fff; width:340px; max-width:90%;
    margin:10% auto; padding:16px; border-radius:8px;
    box-shadow:0 4px 12px rgba(0,0,0,.25); font-family:sans-serif;
  `;

    const title = document.createElement("div");
    title.textContent = "Comment about abnormality";
    title.style.cssText = "font-weight:600; margin-bottom:8px;";

    const select = document.createElement("select");
    select.id = "commentSelect";
    select.style.cssText = "width:100%; padding:8px; margin-bottom:8px;";

    ABNORMALITY_OPTIONS.forEach(opt => {
        const o = document.createElement("option");
        o.value = opt;
        o.textContent = opt;
        select.appendChild(o);
    });

    // Extra input for "Other"
    const otherInput = document.createElement("input");
    otherInput.type = "text";
    otherInput.placeholder = "Please specify...";
    otherInput.style.cssText = "width:100%; padding:6px; display:none; margin-bottom:8px;";
    otherInput.id = "otherComment";

    select.addEventListener("change", () => {
        if (select.value === "Other") {
            otherInput.style.display = "block";
        } else {
            otherInput.style.display = "none";
            otherInput.value = "";
        }
    });

    const btnRow = document.createElement("div");
    btnRow.style.cssText = "display:flex; gap:8px; justify-content:flex-end; margin-top:12px;";

    const okBtn = document.createElement("button");
    okBtn.textContent = "OK";
    okBtn.style.cssText = "padding:6px 12px;";

    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "Cancel";
    cancelBtn.style.cssText = "padding:6px 12px;";

    btnRow.appendChild(cancelBtn);
    btnRow.appendChild(okBtn);

    box.appendChild(title);
    box.appendChild(select);
    box.appendChild(otherInput);
    box.appendChild(btnRow);
    modal.appendChild(box);
    document.body.appendChild(modal);

    modal._select = select;
    modal._otherInput = otherInput;
    modal._okBtn = okBtn;
    modal._cancelBtn = cancelBtn;
}

function showCommentModal(defaultValue = "No Comment") {
    ensureCommentModal();
    const modal = document.getElementById("commentModal");
    const select = modal._select;
    const otherInput = modal._otherInput;

    // preselect default
    const idx = ABNORMALITY_OPTIONS.indexOf(defaultValue);
    select.selectedIndex = idx >= 0 ? idx : 0;
    otherInput.style.display = (select.value === "Other") ? "block" : "none";
    otherInput.value = "";

    modal.style.display = "block";

    return new Promise((resolve) => {
        const onOK = () => {
            let val = select.value;
            if (val === "No Comment") {
                alert("Please select a valid comment (not 'No Comment').");
                return; // do not close
            }
            if (val === "Other") {
                val = otherInput.value.trim();
                if (!val) {
                    alert("Please specify your 'Other' comment.");
                    return; // do not close
                }
                else
                    val = "Other ("+val+")";
            }
            cleanup();
            resolve(val);
        };
        const onCancel = () => {
            cleanup();
            resolve(null);
        };

        const cleanup = () => {
            modal.style.display = "none";
            modal._okBtn.removeEventListener("click", onOK);
            modal._cancelBtn.removeEventListener("click", onCancel);
        };

        modal._okBtn.addEventListener("click", onOK);
        modal._cancelBtn.addEventListener("click", onCancel);
    });
}

function getMousePos(div, evt) {
    var rect = div.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
}
//Mousedown
var tstart;
var tend;
var tsec;
var rect_start;
var rect_end;
var dur;
var chName;
var width = height = 0;
$(div).on('mousedown', function(e) {
  var pos = getMousePos(div, e);
    last_mousex = pos.x;
	last_mousey = pos.y;
  lm_x = e.clientX;
  lm_y = e.clientY;
    mousedown = true;
    tstart = (document.getElementById('startWindowtime').innerHTML);
    tend = (document.getElementById('endWindowtime').innerHTML);
    dur = parseInt(document.getElementById('wd').innerHTML);
    tsec = parseFloat(tstart.charAt(6)+tstart.charAt(7));
    tstart = tstart.substring(0,6);
});

//Mouseup
$(div).on('mouseup', async function(e) {
    mousedown = false;
    var a = dur*(last_mousex/div.offsetWidth);
    if (tsec+a<10){
      rect_start = tstart +'0'+(tsec+ (a));
    }
    else {
      rect_start = tstart +(tsec+ (a));
    }

    var b = dur*(mousex/div.offsetWidth);
    if (tsec+b<10){
      rect_end = tstart + '0'+(tsec+(b));
    }
    else {
      rect_end = tstart + (tsec+(b));
    }
    rect_start = rect_start.substring(0,8) + ':' + rect_start.substring(9);
    rect_end = rect_end.substring(0,8) + ':' + rect_end.substring(9);
    rect_start = rect_start.substring(0,12);
    rect_end = rect_end.substring(0,12);

    if ((parseFloat(rect_start.charAt(6)+rect_start.charAt(7)) < tsec) || ( (parseFloat(rect_start.charAt(6)+rect_start.charAt(7)) == tsec)&&(rect_start.length < 10) ) ){
      rect_start = rect_start.substring(0,6) + tsec + ":000";
    }


    $( "div.ChDiv" ).each(function() {
        rect = (this).getBoundingClientRect();
        if ((rect.top>= lm_y && rect.bottom <= lm_y+height) || (rect.top <= lm_y && rect.bottom >= lm_y+height) || ((lm_y>=rect.top && lm_y <=rect.bottom) && (Math.abs(lm_y-rect.top) < Math.abs(lm_y-rect.bottom))) || ((lm_y>=rect.top && lm_y <=rect.bottom) && (Math.abs(lm_y+height-rect.top) > Math.abs(lm_y+height-rect.bottom)))){
          chName = $(this).find('span').text();
          chArr.push(chName);
        }
    });
    if (rect_start!=rect_end && chArr.length!=0){
        const ok = window.confirm(
                  "Save selected region?\r\nNumber of channels = " + chArr.length +
                  "\r\nStart: " + rect_start + "\r\nEnd: " + rect_end
              );
              if (ok) {
                  // show dropdown modal instead of prompt
                  const picked = await showCommentModal("No Comment");
                  if (picked === null) {
                      // user cancelled => do nothing (but still clear at the very end)
                  } else {
                      com = picked;

                      // safer join for channel names
                      var s = (chArr && chArr.length) ? chArr.join(' ') : "";

                      // ===== keep your existing normalization/time-fix logic unchanged =====
                      st_mil = rect_start.substring(9);
                      end_mil = rect_end.substring(9);

                      st_h = parseInt(rect_start.substring(0,2));
                      end_h = parseInt(rect_end.substring(0,2));

                      st_m = parseInt(rect_start.substring(3,5));
                      end_m = parseInt(rect_end.substring(3,5));

                      st_s = parseInt(rect_start.substring(6,8));
                      end_s = parseInt(rect_end.substring(6,8));

                      if (st_s>59){ st_s = st_s - 60; st_m = st_m + 1; }
                      if (end_s>59){ end_s = end_s - 60; end_m = end_m + 1; }

                      if (st_m>59){ st_m = st_m - 60; st_h = st_h + 1; }
                      if (end_m>59){ end_m = end_m - 60; end_h = end_h + 1; }

                      if (st_h>23){ st_h = st_h - 24; }
                      if (end_h>23){ end_h = end_h - 24; }

                      if (st_h<10){ st_h = ('0' + st_h).substring(0,2); }
                      if (st_m<10){ st_m = ('0' + st_m).substring(0,2); }
                      if (st_s<10){ st_s = ('0' + st_s).substring(0,2); }

                      if (end_h<10){ end_h = ('0' + end_h).substring(0,2); }
                      if (end_m<10){ end_m = ('0' + end_m).substring(0,2); }
                      if (end_s<10){ end_s = ('0' + end_s).substring(0,2); }

                      rect_start = st_h + ':' + st_m + ':' + st_s + ':' + st_mil;
                      rect_end = end_h + ':' + end_m + ':' + end_s + ':' + end_mil;

                      new_row = ['', '', '', rect_start, rect_end, s, com];
                      csv_ar.push(new_row);
                  }
              }
          } else {
              alert("No region was selected. Please click ONCE outside the drawing area and try again")
          }

          // clear overlay + reset
          ctx.clearRect(0,0,canvas.width,canvas.height);
          chArr = [];
});

//Mousemove
$(div).on('mousemove', function(e) {
  var pos = getMousePos(div, e);
    mousex = pos.x;
	mousey = pos.y;
    if(mousedown) {
        ctx.clearRect(0,0,canvas.width,canvas.height); //clear canvas
        ctx.beginPath();
        width = e.clientX-lm_x;
        height = e.clientY-lm_y;
        ctx.rect(lm_x,lm_y,width,height);
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.fillStyle = "rgba(150, 0, 0, 0.3)";
        ctx.fill()
        ctx.stroke();

    }
    //Output

});
var modal = document.getElementById("writeModal");
var button = document.getElementById("acceptWrite");
document.getElementById("write").onclick = function() {modalWrite()};
document.getElementById("erase").onclick = function() {erase()};
function modalWrite(){
    modal.style.display = "block";
}
button.onclick = function() {
    const us_age = $('input[name="getAge"]').val().trim();
    const checked = document.querySelector('input[name="gender"]:checked');
    const us_gen = checked ? checked.value : "";

    // === Checks ===
    if (!us_age) {
        alert("Please enter age.");
        return; // stop, don’t close
    }
    if (!us_gen) {
        alert("Please select gender.");
        return; // stop, don’t close
    }

    // Only if both are filled:
    modal.style.display = "none";
    console.log("Need to add check of no abnormality labeled")
    csv_ar[1][0] = us_gen;
    csv_ar[1][1] = us_age;
    writeToCSV(csv_ar);
};
// button.onclick = function() {
//   var us_age = $('input[name="getAge"]').val();
//   var us_gen
//   if (document.getElementById('gen1').checked) {
//     us_gen = document.getElementById('gen1').value;
//   }
//   if (document.getElementById('gen1').checked) {
//     us_gen = document.getElementById('gen1').value;
//   }
//   if (document.getElementById('gen1').checked) {
//     us_gen = document.getElementById('gen1').value;
//   }
//   modal.style.display = "none";
//   csv_ar[1][0] = us_gen;
//   csv_ar[1][1] = us_age;
//   writeToCSV(csv_ar)
// }
let uploadedFileName = "my_data.csv"; // fallback
function writeToCSV(ar){
    console.log(uploadedFileName)
    ar[1][2] = myStart;
    let csvContent = "data:text/csv;charset=utf-8," + ar.map(e => e.join(",")).join("\n");
    var encodedUri = encodeURI(csvContent);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", uploadedFileName.replace(/\.edf$/i, ".csv") ||"my_data.csv");
    document.body.appendChild(link); // Required for FF
    link.click();
    erase();
  }

  window.onclick = function(event) {
    // if (event.target == modal) {
    //   modal.style.display = "none";
    // }
  }

function erase(){
  if(window.confirm("Erase current labels?")){
    csv_ar = [["Gender","Age","File Start","Start time","End time","Channel names","Comment"]];
    call = 'e';
  }
}

document.getElementById('ann-input').addEventListener('change', annotate_local, false);
function annotate_local(e)
{
    var ann_csv = e.target.files[0]
    if (ann_csv) {
            uploadedFileName = ann_csv.name;   // capture name
    }
    var reader = new FileReader();
    reader.addEventListener('load', function (e) {
            let csvdata = e.target.result;


            let newLinebrk = csvdata.split("\n");
            for(let i = 0; i < newLinebrk.length; i++) {

            parsedata.push(newLinebrk[i].split(","))
          }

    });

reader.readAsText(ann_csv);
if (first_draw){

  readEEG();
}
}

document.getElementById('tru-input').addEventListener('change', true_local, false);
function true_local(e)
{
  console.log("Process trudata");
var tru_csv = e.target.files[0]
var reader = new FileReader();
reader.addEventListener('load', function (e) {
        let csvdata = e.target.result;


        let newLinebrk = csvdata.split("\n");
        for(let i = 0; i < newLinebrk.length; i++) {

        trudata.push(newLinebrk[i].split(","))
      }

      trufirst = trudata[0]
      trusecond = trudata[1]
      t_col1 = trufirst.indexOf("Start time");
      t_col2 = trufirst.indexOf("End time");
      fs_col = trufirst.indexOf("File Start");

      trudata = trudata.map(function(val){
        return val.slice(t_col1,t_col2+1)
      })

      trudata.shift()

      if (fs_col!=-1){
        tru_fs = trusecond[fs_col];
      }
    });

reader.readAsText(tru_csv);
if (first_draw){
  readEEG();
}
}
