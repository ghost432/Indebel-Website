const { thresholds } = require('./catalog');

function isTradeIndexable(trade) {
    return Boolean(
        trade
        && trade.indexableByDefault
        && (!thresholds.trade.requiresSourceId || Number.isInteger(trade.sourceId))
        && thresholds.trade.allowedTypes.includes(trade.type)
        && (!thresholds.trade.requiresSpecificEditorialContent || (trade.intro && trade.scope?.length >= 3))
    );
}

function isLocalityIndexable(locality) {
    return Boolean(
        locality
        && locality.indexableByDefault
        && locality.seoPriority <= thresholds.locality.maximumPriorityForInitialIndexing
        && (!thresholds.locality.requiresNisCode || /^\d{5}$/.test(locality.nisCode))
        && (!thresholds.locality.requiresSpecificEditorialContent || locality.intro)
    );
}

function getCombinationDecision(trade, locality, data = {}) {
    if (!isTradeIndexable(trade) || !isLocalityIndexable(locality)) {
        return { indexable: false, reason: 'parent-under-threshold' };
    }

    const entry = thresholds.combination.allowlist.find((candidate) => (
        candidate.trade === trade.slug && candidate.locality === locality.slug
    ));
    if (!entry?.validated) return { indexable: false, reason: 'not-on-controlled-allowlist' };

    const evidence = {
        professionals: Number(data.professionals ?? entry.evidence?.professionals ?? 0),
        validatedRequests: Number(data.validatedRequests ?? entry.evidence?.validatedRequests ?? 0)
    };
    const observedSignals = [
        ...(entry.signals || []),
        ...(evidence.professionals >= thresholds.combination.minimumProfessionals ? ['professionals-threshold'] : []),
        ...(evidence.validatedRequests >= thresholds.combination.minimumValidatedRequests ? ['requests-threshold'] : [])
    ];
    const uniqueSignals = [...new Set(observedSignals)];
    const professionalsThresholdMet = evidence.professionals >= thresholds.combination.minimumProfessionals;
    const requestsThresholdMet = evidence.validatedRequests >= thresholds.combination.minimumValidatedRequests;
    const distinctiveSignalsThresholdMet = uniqueSignals.length >= thresholds.combination.minimumDistinctiveSignals;
    return {
        indexable: professionalsThresholdMet && requestsThresholdMet && distinctiveSignalsThresholdMet,
        reason: professionalsThresholdMet && requestsThresholdMet ? 'controlled-allowlist' : 'data-threshold-not-met',
        signals: uniqueSignals,
        evidence,
        note: entry.note
    };
}

function isSeoCombinationIndexable(trade, locality, data = {}) {
    return getCombinationDecision(trade, locality, data).indexable;
}

module.exports = {
    isTradeIndexable,
    isLocalityIndexable,
    getCombinationDecision,
    isSeoCombinationIndexable
};
