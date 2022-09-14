// Trigger automatically fires whenever a new request queue item appears 
//    removes item from new request queue, does calculations and adds to new-requests-processed queue

// automatically creates output queue if it doesn't exist
module.exports = async function (context, newRequest) {
    context.log.verbose('removeFromNewRequestQueueTrigger: Begin', context.bindingData.insertionTime, newRequest);
    
    // calculation

    context.bindings.newRequestProcessed = newRequest;

    context.log.verbose('removeFromNewRequestQueueTrigger: End', newRequest);
};