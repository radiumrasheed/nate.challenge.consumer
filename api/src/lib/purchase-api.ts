import {Product, PRODUCTS} from '../products';
import {getAccountBalance} from './risk-api';
import {assessRisk, RiskOutcome} from '../risk';
import {acceptPurchase, flagPurchaseForReview, PurchaseDetails, rejectPurchase} from './action-api';

export enum PurchaseStatus {
    SUCCESS = 'success',
    MERCHANT_REJECTED = 'merchant-rejected',
    CHARGE_FAILED = 'charge-failed',
    INVALID_DETAILS = 'invalid-details',
    PENDING = 'pending',
    REJECTED = 'rejected'
}

const getRandomPurchaseStatus = (): PurchaseStatus => {
    const statuses: PurchaseStatus[] = [
        ...Array.from(new Array(50), () => PurchaseStatus.SUCCESS),
        ...Array.from(new Array(5), () => PurchaseStatus.MERCHANT_REJECTED),
        ...Array.from(new Array(5), () => PurchaseStatus.CHARGE_FAILED),
        ...Array.from(new Array(5), () => PurchaseStatus.INVALID_DETAILS),
    ]

    return statuses[Math.floor(Math.random() * statuses.length)];
};

const getDelayedPurchaseStatus = async (status: PurchaseStatus): Promise<PurchaseStatus> => {
    return new Promise((resolve) => {
        const timeout = 100 + (Math.random() * 400);

        setTimeout(() => resolve(status), timeout);
    });
};

export const getProductById = (productId: number): Product | null => PRODUCTS.find(product => product.productId === productId) || null;

export const isAffordable = async (userId: string, product: Product): Promise<boolean> => {
    const userBalance = await getAccountBalance(userId);

    // apply discount code before checking price... [out of scope, maybe]

    return product.productPrice <= userBalance;
}

export const executePurchase = async (userId: string, productId: number, paymentMethodId: string): Promise<PurchaseStatus> => {
    console.log(`Executing purchase for product with ID ${productId}`);

    const purchaseDetail: PurchaseDetails = {
        userId,
        productId,
        paymentMethodId,
        status: PurchaseStatus.PENDING,
        createdAt: new Date().toISOString()
    };

    // get product...
    const product = getProductById(productId);
    if (!product) {
        console.error('Invalid product details');
        return PurchaseStatus.INVALID_DETAILS;
    }

    // check if balance is enough...
    const userCanAfford = await isAffordable(userId, product)
    if (!userCanAfford) {
        console.error('Insufficient balance');
        return PurchaseStatus.CHARGE_FAILED;
    }

    // check risk...
    const riskOutcome = await assessRisk(userId, paymentMethodId);
    switch (riskOutcome) {
        case RiskOutcome.ACCEPTED:
            await acceptPurchase(purchaseDetail);
            return PurchaseStatus.SUCCESS;
        case RiskOutcome.REJECTED:
            await rejectPurchase(purchaseDetail);
            return PurchaseStatus.REJECTED;
        case RiskOutcome.FLAGGED_FOR_REVIEW:
            await flagPurchaseForReview(purchaseDetail);
            return PurchaseStatus.PENDING;
        default:
            console.error('could not determine risk outcome')
            return PurchaseStatus.REJECTED
    }
};
