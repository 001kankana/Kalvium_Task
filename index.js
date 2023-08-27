const express = require('express');
const fs = require('fs');
const app = express();
const path = require('path');

let history = [];


try {
  const data = fs.readFileSync(path.join(__dirname, 'history.json'), 'utf8');
  history = JSON.parse(data);
} catch (err) {
  console.log('No history');
}

const saveHistory = () => {
    fs.readFile('history.json', 'utf8', (err, data) => {
        if (err) {
          console.error(err);
          return;
        }

        const jsonData = JSON.parse(data);
        const filteredData = jsonData.filter(item => item.question !== null && item.answer !== null);

        fs.writeFile('history.json', JSON.stringify(filteredData), 'utf8', err => {
          if (err) {
            console.error(err);
            return;
          }
      
          console.log('Successfully removed null values');
        });
       });

  fs.writeFileSync(path.join(__dirname, 'history.json'), JSON.stringify(history));
};

app.get('/', (req, res) => {
  res.send(`<div style="font-family: Lucida Console, Courier New, monospace;">Math Operations BACKEND! <br> <h3>ENDPOINTs</h3><ul><li><h5>OPERATIONS &nbsp; > &nbsp; /operand/operator/operand... </h5></li><li><h5> HISTORY &nbsp; > &nbsp; /history</h5></li></ul></div>`);
});

app.get('/history', (req, res) => {
    res.send(`<div style="font-family: Lucida Console, Courier New, monospace;"><h1>Histroy:</h1><ul>${history.map(op => `<li><p><b>EXPRESSION:&nbsp; ${op.question} <br><br>  ANSWER:&nbsp; ${op.answer}</b></p></li><br>`).join('')}</ul></div>`);
});

app.get('/*', (req, res) => {
    const tokens = req.params[0].split('/');
    const precedence = {
      'plus': 1,
      'minus': 1,
      'into': 2,
      'divide': 2,
    };
  
    const performOperation = (op1, op2, operator) => {
      switch (operator.toLowerCase()) {
        case 'plus':
          return op1 + op2;
        case 'minus':
          return op1 - op2;
        case 'into':
          return op1 * op2;
        case 'divide':
          if (op2 === 0) {
            throw new Error('Division by zero');
          }
          return op1 / op2;
        default:
          throw new Error('Invalid operation');
      }
    };
   
    const applyPrecedence = (operands, operators) => {
      while (operators.length > 0) {
        let index = 0;
        let maxPrecedence = -1;
  
        for (let i = 0; i < operators.length; i++) {
          if (precedence[operators[i]] > maxPrecedence) {
            maxPrecedence = precedence[operators[i]];
            index = i;
          }
        }
  
        const result = performOperation(operands[index], operands[index + 1], operators[index]);
        operands.splice(index, 2, result);
        operators.splice(index, 1);
      }
      return operands[0];
    };
  
    try {
      const operands = [];
      const operators = [];
  
      for (let i = 0; i < tokens.length; i++) {
        if (i % 2 === 0) {
          operands.push(parseFloat(tokens[i]));
        } else {
          operators.push(tokens[i]);
        }
      }
  
      const answer = applyPrecedence(operands, operators);
      const question = req.params[0];
  
      const operationData = {
        question,
        answer,
      };
  
      history.unshift(operationData);
  
      if (history.length > 20) {
        history.pop();
      }
  
      saveHistory();
  
      res.send(`<div style="font-family: Lucida Console, Courier New, monospace;"><h1>OUTPUT</h1><h3>EXPRESSION:</h3><b>&nbsp; ${operationData.question}</b> <br> <h3>ANSWER:</h3> <b>&nbsp; ${operationData.answer}</b></div>`);
    } catch (error) {
      res.status(400).send({ error: error.message });
    }
  });

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
