import {assessRisk, RiskOutcome} from '../src/risk';
import * as RiskApi from '../src/lib/risk-api'

describe('Risk', () => {
    describe('assessRisk', () => {
        test('should return REJECTED if more than 1 missed payment', async () => {
            // arrange
            const spy = jest.spyOn(RiskApi, 'getNumMissedPayments')
            spy.mockResolvedValue(3)

            // act
            const risk = await assessRisk('', '')

            // assert
            expect(risk).toBe(RiskOutcome.REJECTED);

            // cleanup
            spy.mockRestore()
        });

        describe('when no missed payment,', () => {
            let spyOnMissedPayments: jest.SpyInstance;

            beforeEach(() => {
                spyOnMissedPayments = jest.spyOn(RiskApi, 'getNumMissedPayments')
                spyOnMissedPayments.mockResolvedValue(0)
            })

            afterEach(() => {
                spyOnMissedPayments.mockRestore()
            })

            test('should return REJECTED if risk score is more than 90', async () => {
                // arrange
                const spy = jest.spyOn(RiskApi, 'getRiskScore')
                spy.mockResolvedValue(97)

                // act
                const risk = await assessRisk('', '')

                // assert
                expect(risk).toBe(RiskOutcome.REJECTED);
            });

            test('should return ACCEPTED if risk score is less than 80', async () => {
                // arrange
                const spy = jest.spyOn(RiskApi, 'getRiskScore')
                spy.mockResolvedValue(17)

                // act
                const risk = await assessRisk('', '')

                // assert
                expect(risk).toBe(RiskOutcome.ACCEPTED);
            });

            test('should return FLAGGED_FOR_REVIEW if risk score is less between 80 and 90', async () => {
                // arrange
                const spy = jest.spyOn(RiskApi, 'getRiskScore')
                spy.mockResolvedValue(85)

                // act
                const risk = await assessRisk('', '')

                // assert
                expect(risk).toBe(RiskOutcome.FLAGGED_FOR_REVIEW);
            });
        })
    })
})
