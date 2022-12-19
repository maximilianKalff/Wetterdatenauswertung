// Upload file
const myForm = document.getElementById("myForm");
const csvFile = document.getElementById("csvFile");

function csvToArray(str, delimiter = ",") {

  // slice from start of text to the first \n index
  // use split to create an array from string by delimiter
  const headers = str.slice(0, str.indexOf("\n")).split(delimiter);

  // slice from \n index + 1 to the end of the text
  // use split to create an array of each csv value row
  const rows = str.slice(str.indexOf("\n") + 1).split("\n");

  // Map the rows
  // split values from each row into an array
  // use headers.reduce to create an object
  // object properties derived from headers:values
  // the object passed as an element of the array
  const arr = rows.map(function (row) {
    const values = row.split(delimiter);
    const el = headers.reduce(function (object, header, index) {
      object[header] = values[index];
      return object;
    }, {});
    return el;
  });

  // return the array
  return arr;
}

function createSelect(loc_attributes){
  // This function creates the content of the drop down select form.

  var select_x = document.getElementById('x_axis_value');
  var select_y = document.getElementById('y_axis_value');
  var att_length = loc_attributes.length;
  for (var i = 0; i < att_length; i++){
    //check all attributes and replace them
    if(loc_attributes[i].includes("CPU")){
      loc_attributes[i] = "Zeit in Minuten";
    }
    else if (loc_attributes[i].includes("hh")){
      loc_attributes[i] = "Uhrzeit";
    }
    else if (loc_attributes[i].includes("temp")){
      loc_attributes[i] = "Temperatur in °C";
    }
    else if (loc_attributes[i].includes("alt")){
      loc_attributes[i] = "Höhe in m";
    }
    else if (loc_attributes[i].includes("pres")){
      loc_attributes[i] = "Luftdruck in hPa";
    }
    else if (loc_attributes[i].includes("hum")){
      loc_attributes[i] = "Luftfeuchtigkeit in %";
    }
    else if (loc_attributes[i].includes("lat")){
      loc_attributes[i] = "Breitengrad";
    }
    else if (loc_attributes[i].includes("lng")){
      loc_attributes[i] = "Längengrad";
    }


    var opt_x = document.createElement('option');
    opt_x.value = loc_attributes[i]; // Den einzelnen Options werden Attribute zugewiesen
    opt_x.innerHTML = loc_attributes[i]; //dem Nutzer werden einzelne Attributsnamen angezeigt
    select_x.appendChild(opt_x);

    var opt_y = document.createElement('option');
    opt_y.value = loc_attributes[i]; // values sind die einzelnen Attributsnamen
    opt_y.innerHTML = loc_attributes[i]; // dem Nutzer werden einzelne Attributsnamen angezeigt
    select_y.appendChild(opt_y);
  }
  return (loc_attributes);
}

function getX() {
  selectElement = document.querySelector('#x_axis_value');
  output = selectElement.value;
  return(output);
}

function getY(){
  selectElement = document.querySelector('#y_axis_value');
  output = selectElement.value;
  return(output);
}

//Read File
var data = [];
myForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const input = csvFile.files[0];
  const reader = new FileReader();

  reader.onload = function (e) {
    const text = e.target.result;
    data = csvToArray(text); //eingelesene Daten
    let attributes = Object.keys(data[1]); // Spaltennamen
    updated_att = createSelect(attributes);
    
    var temp = {}; //Dict mit neuem Value zu altem value 
    for (var i in updated_att) {
      temp[Object.keys(data[1])[i]] = updated_att[i];
    }
    for (j in data){
      for (var key in data[j]){

        if (data[j][temp[key]] == updated_att[key]){
          var val = data[j][key]
          data[j][temp[key]] = val;
        }      
      }
      
    }
  };

  reader.readAsText(input);
  
});

//x-Axis Selction
var x_axis = "";
var y_axis = "";
var x_axis_options = document.getElementById("x_axis_value");
x_axis_options.addEventListener("change", function(){
  x_axis = x_axis_options.value;
  if (x_axis == 'no_selection'){
    alert("Bitte wählen Sie gültige Daten aus!");
  }
  if (y_axis != ""){
    createCharts(x_axis, y_axis);// calls createCharts function
  }
});

//y-Axis Selection
var y_axis_options = document.getElementById("y_axis_value");
y_axis_options.addEventListener("change", function(){
  y_axis = y_axis_options.value;
  if (y_axis == 'no_selection'){
    alert("Bitte wählen Sie gültige Daten aus!");
  }
  if (x_axis != ""){
    createCharts(x_axis, y_axis); // calls createCharts function
  }
});

function getChartData(data){
  let x_axis = getX();
  let y_axis = getY();
  
  let x_data = [];
  let y_data = [];
  let splitter = 0; //Verkürzen der Datenmenge
  // !!!!!!!!!!!!!SPLITTER MUSS AUF DATENMENGE INDIVIDUELL ANGEPASST WERDEN!!!!!!!!!!!!
  for (let i = 0; i < (data.length -1); i++){
    if (splitter == 15){
      x_data.push(data[i][x_axis]);
      y_data.push(data[i][y_axis]);
      splitter = 0;
    }
    splitter++;
  }
  let output = {"x_axis": x_data, "y_axis": y_data};
  return(output);

}

//überprüft, ob bereits ein Chart existiert; wenn ja wird dieser zerstört.
function destroyChart(){
  let chartStatus = Chart.getChart("chart");
  if (chartStatus != undefined) {
    chartStatus.destroy();
  }
}

function createCharts(x_axis_value, y_axis_value){
  //allgemeiner Chart
  let chartData = getChartData(data);
  let x_data = chartData["x_axis"];
  let y_data = chartData["y_axis"];
  destroyChart();

  if (x_axis_value == "Zeit in Minuten"){
    for (i in x_data){
      x_data[i] = Math.round(x_data[i]/60000);

    }
  }

  var myChart = new Chart(document.getElementById('chart'), {
    type: 'line',
    data:{
      labels: x_data,
      datasets:[{
        //label: (x_axis_value + " - " + y_axis_value),
        backgroundColor: '#58508d',
        borderColor: '#58508d',        
        data: y_data,
      }]
    },
    options: {
      pointRadius: 1,
      pointHoverRadius: 1,
      beginAtZero: true,
      scales: {
        y: {
          title: {
            display: true,
            align: 'center', 
            text: y_axis_value,
          }
        },  
        x: {
          title: {
            display: true,
            align: 'center', 
            text: x_axis_value,
          },
          ticks: {
            callback: function(value, index, ticks) {
              if (value % 50 == 0) {
                return value;
              }
              
            }
            
            
          }
        }      
      }, 
      plugins: {
        legend: {
          display: false,
        }
      }  
    }
  })
  
}
