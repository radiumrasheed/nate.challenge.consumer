import {executePurchase, getProductById, isAffordable, PurchaseStatus} from "../src/lib/purchase-api";
import {PRODUCTS} from "../src/products";
import * as RiskApi from "../src/lib/risk-api";
import * as Risk from "../src/risk";
import {RiskOutcome} from "../src/risk";

describe('Purchase API', () => {
    describe('getProductById', () => {
        test('should return valid product', () => {
            // arrange
            let productId = 1

            // act
            const product = getProductById(productId)

            // assert
            expect(product).toBeTruthy();
            expect(product.productId).toBeDefined()
        });

        test('should return null value for product', () => {
            // arrange
            let productId = 999

            // act
            const product = getProductById(productId)

            // assert
            expect(product).toBeNull();
            expect(product?.productId).toBeUndefined()
        });
    })

    describe('isAffordable', () => {
        test('should return true if customer has more balance than product', async () => {
            // arrange
            let product = PRODUCTS[0]
            const spy = jest.spyOn(RiskApi, 'getAccountBalance');
            spy.mockResolvedValue(product.productPrice + 100)

            // act
            const affordable = await isAffordable('john', product)

            // assert
            expect(affordable).toBeTruthy();
            spy.mockRestore();
        });

        test('should return false if customer has less balance than product', async () => {
            // arrange
            let product = PRODUCTS[0]
            const spy = jest.spyOn(RiskApi, 'getAccountBalance');
            spy.mockResolvedValue(product.productPrice - 100)

            // act
            const affordable = await isAffordable('john', product)

            // assert
            expect(affordable).toBeFalsy();
            spy.mockRestore();
        });

        test('should return true if customer has same balance as product', async () => {
            // arrange
            let product = PRODUCTS[0]
            const spy = jest.spyOn(RiskApi, 'getAccountBalance');
            spy.mockResolvedValue(product.productPrice)

            // act
            const affordable = await isAffordable('john', product)

            // assert
            expect(affordable).toBeTruthy();
            spy.mockRestore();
        });
    })

    describe('executePurchase', () => {
        test('should return INVALID if product does not exist', async () => {
            // arrange
            let productId = 9999

            // act
            const response = await executePurchase('john', productId, 'NATE')

            // assert
            expect(response).toBe(PurchaseStatus.INVALID_DETAILS);
        });

        test('should return CHARGE_FAILED if balance is insufficient', async () => {
            // arrange
            let product = PRODUCTS[0]
            const spy = jest.spyOn(RiskApi, 'getAccountBalance');
            spy.mockResolvedValue(product.productPrice - 100)

            // act
            const response = await executePurchase('john', product.productId, 'NATE')

            // assert
            expect(response).toBe(PurchaseStatus.CHARGE_FAILED);
            spy.mockRestore()
        });

        test('should return ACCEPTED if balance is OK and risk is accepted', async () => {
            // arrange
            let product = PRODUCTS[0]
            const spy = jest.spyOn(RiskApi, 'getAccountBalance');
            const spy2 = jest.spyOn(Risk, 'assessRisk');
            spy.mockResolvedValue(product.productPrice)
            spy2.mockResolvedValue(RiskOutcome.ACCEPTED)

            // act
            const response = await executePurchase('john', product.productId, 'NATE')

            // assert
            expect(response).toBe(PurchaseStatus.SUCCESS);

            // cleanup
            spy.mockRestore()
            spy2.mockRestore()
        });

        test('should return REJECTED if balance is OK and risk is rejected', async () => {
            // arrange
            let product = PRODUCTS[0]
            const spy = jest.spyOn(RiskApi, 'getAccountBalance');
            const spy2 = jest.spyOn(Risk, 'assessRisk');
            spy.mockResolvedValue(product.productPrice)
            spy2.mockResolvedValue(RiskOutcome.REJECTED)

            // act
            const response = await executePurchase('john', product.productId, 'NATE')

            // assert
            expect(response).toBe(PurchaseStatus.REJECTED);

            // cleanup
            spy.mockRestore()
            spy2.mockRestore()
        });

        test('should return REJECTED if balance is OK and risk is rejected', async () => {
            // arrange
            let product = PRODUCTS[0]
            const spy = jest.spyOn(RiskApi, 'getAccountBalance');
            const spy2 = jest.spyOn(Risk, 'assessRisk');
            spy.mockResolvedValue(product.productPrice)
            spy2.mockResolvedValue(RiskOutcome.FLAGGED_FOR_REVIEW)

            // act
            const response = await executePurchase('john', product.productId, 'NATE')

            // assert
            expect(response).toBe(PurchaseStatus.PENDING);

            // cleanup
            spy.mockRestore()
            spy2.mockRestore()
        });
    })
})
