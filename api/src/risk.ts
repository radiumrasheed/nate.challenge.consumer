// note - the signature of this function can be modified to suit any assumptions made about the risk flow
import {getNumMissedPayments, getRiskScore} from './lib/risk-api';

export enum RiskOutcome {
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  FLAGGED_FOR_REVIEW = 'flagged_for_review'
};

const MISSED_PAYMENT_THRESHOLD = 1;
const ACCEPTED_RISK_SCORE = 80;
const DECLINED_RISK_SCORE = 90;



const assessRisk = async (userId: string, paymentMethodId: string): Promise<RiskOutcome> => {
  console.debug(`checking risk for user ${userId}`);

  const numberOfMissedPayments = await getNumMissedPayments(userId);

  if (numberOfMissedPayments > MISSED_PAYMENT_THRESHOLD) {
    console.error(`rejecting due to failed payments`);
    return RiskOutcome.REJECTED;
  }

  const riskScore = await getRiskScore(paymentMethodId);

  if (riskScore < ACCEPTED_RISK_SCORE) {
    console.info(`user ${userId} accepted with score of ${riskScore}`);

    return RiskOutcome.ACCEPTED;
  } else if (riskScore > DECLINED_RISK_SCORE) {
    console.error(`user ${userId} declined with score of ${riskScore}`);

    return RiskOutcome.REJECTED;
  } else {
    console.warn(`user ${userId} flagged for review with score of ${riskScore}`);

    return RiskOutcome.FLAGGED_FOR_REVIEW;
  }
};

export { assessRisk };
