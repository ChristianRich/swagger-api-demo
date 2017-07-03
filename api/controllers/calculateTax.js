import _ from 'lodash';

const taxBands = require('../models/taxBands.json');
const SUPER_ANNUATION_PCT = 0.095;

module.exports = {

	get: (req, res) => {

		const income = Math.floor(req.swagger.params.income.value);

		res
			.status(200)
			.json(calc(income));
	}
};

/**
 * Exposing method for unit testing
 * @param {number} income
 * @return {object}
 */
const calc = function(income){

    return {
        baseSalary: income,
        superannuation: calculateSuperAnnuation(income),
        taxes: {
            income: calculateTax(income),
            medicare: calculateMedicareLevy(income),
            total: Math.round(calculateTax(income) + calculateMedicareLevy(income))
        },
        postTaxIncome: income - (Math.round(calculateTax(income) + calculateMedicareLevy(income)))
    };
};

/**
 * Returns the tax band from annual income
 * @param {number} income
 * @return {number}
 */
const getTaxBand = function(income){

    let result;

    _.each(taxBands, function(taxBand){
        if(income >= taxBand.from && (taxBand.to && income <= taxBand.to)){
            result = taxBand;
        }
    });

    // No band found, so we must be in the highest band
    if(!result){
        result = taxBands[taxBands.length - 1];
    }

    return result;
};

/**
 * Calculates payable tax from annual income
 * @param {number} income
 * @return {number}
 */
const calculateTax = (income) => {

    const band = getTaxBand(income), // Get the band for this income
        cumulativeTax = band.cumulative, // Get the cumulative tax from lower bands
        taxableAmount = income - band.from, // Get the taxable income for this band
        taxPayable = cumulativeTax + (taxableAmount * (band.rate / 100)); // Calculate cumulative tax + this band's tax

    return Math.round(taxPayable);
};

/**
 * Returns the Medicare levy in Dollars from annual income
 * @param {number} income
 * @return {number}
 */
const calculateMedicareLevy = (income) => {
    const pct = getMedicareLevyPercent(income);
    return income * (pct / 100);
};

/**
 * Returns the Medicare levy percentage
 * @param {number} income
 * @return {number}
 */
const getMedicareLevyPercent = (income) => {

    if(income < 21336){
        return 0;
    }

    if(income > 21336 && income < 26668){
        return (26668 - 21336) * 0.1;
    }

    return 2;
};

/**
 * Returns 9.5% super annual
 * @param {number} income
 * @return {number}
 */
const calculateSuperAnnuation = (income) => {
    return income * SUPER_ANNUATION_PCT;
};
