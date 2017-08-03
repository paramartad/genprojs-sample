// Sample 1 for genprojs

const Genpro = require('genprojs');
const fs = require('fs');
const csvParse = require('csv-parse/lib/sync');
const shuffle = require('shuffle-array');


const Operation = Genpro.Operation;
const Variable = Genpro.Variable;
const Chromosome = Genpro.Chromosome;

// DATA INFO
// The data (X1, X2, X3, X4, X5) are by city.
// X1 = death rate per 1000 residents
// X2 = doctor availability per 100,000 residents
// X3 = hospital availability per 100,000 residents
// X4 = annual per capita income in thousands of dollars
// X5 = population density people per square mile
// Reference: Life In America's Small Cities, by G.S. Thomas
// Attempt to create a program that predicts X1

let textFileContent = fs.readFileSync('data/mlr07.csv', 'utf-8');
let allData = csvParse(textFileContent, {columns: true});

// shuffle data
shuffle(allData);
// split 80/20
let splitIndex = Math.floor(allData.length * 0.8) - 1;
let trainingData = allData.splice(0, splitIndex);
let testingData = allData;

// Use basic math operations as available functions
const availableFunctions = [
    Genpro.BasicMathOperations.add,
    Genpro.BasicMathOperations.subtract,
    Genpro.BasicMathOperations.multiply,
    Genpro.BasicMathOperations.divide,
    Genpro.BasicMathOperations.power
];
// Define input variables: X2, X3, X4, X5
// See above
const inputVariables = ['X2', 'X3', 'X4', 'X5'].map(key => new Variable(key));

// define fitness function
// simple exponential fitness function, between 1-e^7
const fitnessFn = (individual, functions, variables, data) => {
    let maxPower = 7;
    let fitnessValSum = data.reduce((sum, vt) => {
        let val = Chromosome.val(individual, functions, variables, vt);
        if (isNaN(val)) return sum + 1;

        let distance = Math.abs((vt.X1-val));
        let power = maxPower - (distance / maxPower);
        return sum + Math.pow(Math.E, power);
    }, 0);
    fitnessVal = fitnessValSum / data.length;
    return fitnessVal;
};

// Genetic Programming options
let options = {
    populationSize: 100,
    minDepth: 2,
    maxDepth: 6,
    crossoverProbability: 0.70,
    mutationProbability: 0.005,
    maxIteration: 500,
    fitnessFn: fitnessFn
};

// run genprojs
let result = Genpro.run(availableFunctions, inputVariables, trainingData, testingData, options);

// get best individual
let bestIndividual = result.stat.maxIndividual;
// evaluate against test data
testingData.forEach(td => {
    let calculatedValue = Chromosome.val(bestIndividual, availableFunctions, inputVariables, td);
    console.log('---------------------------');
    console.log('Predicted: ' + calculatedValue);
    console.log('Actual: ' + td.X1);
    console.log('Delta: ' + Math.abs(calculatedValue - td.X1));
});