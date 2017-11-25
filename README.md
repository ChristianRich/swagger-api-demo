# Swagger API demo

### Live demo (free account may take 10 seconds to load)
[https://swagger-tax-calc-api.herokuapp.com](https://swagger-tax-calc-api.herokuapp.com)

Sample project featuring best practice of API building and testing using [swagger.io](https://swagger/io)  

For the purpose of demonstation this API calculates your personal income tax using 2016-17 ATO rates as per below table.  

| Taxable income     | Tax on this income                         |
|--------------------|--------------------------------------------|
| 0 – $18,200        | Nil                                        |
| $18,201 – $37,000  | 19c for each $1 over $18,200               |
| $37,001 – $87,000  | $3,572 plus 32.5c for each $1 over $37,000 |
| $87,001 – $180,000 | $19,822 plus 37c for each $1 over $87,000  |
| $180,001 and over  | $54,232 plus 45c for each $1 over $180,000 |

Calculation includes Medicare levy.

Source: [https://www.ato.gov.au/rates/individual-income-tax-rates/](https://www.ato.gov.au/rates/individual-income-tax-rates/)

### Install
 `npm install`
 
### Run  
`npm start`

### Run using Docker
`docker build -t tax .`  

`docker run -it -p 8000:3000 -t tax`  

App is now available at [http://localhost:8000](http://localhost:8000)

### Test
`npm test`

### Generate HTML code coverage report in /coverage directory
`npm run coverage`  

### Swagger UI
When project is up and running you should see the Swagger UI live docs:

![Swagger UI](https://raw.githubusercontent.com/ChristianRich/swagger-api-demo/master/images/swagger.png)
