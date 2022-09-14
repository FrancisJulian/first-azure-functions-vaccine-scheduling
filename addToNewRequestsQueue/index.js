// adds to new-requests queue
//    another trigger removes items from the newRequests queue

// creates output queue if it doesn't exist
// errors are caught by azure and placed in log
module.exports = async function (context, req) {
    context.log.verbose('addToNewRequestsQueue: Begin', req.body);

    const id  =  req.query.id   || req.body?.id 
              || req.query.name || req.body?.name;
    const age = (req.query.age  || req.body?.age)   || -1;
    
    if (!id) {
      context.res = { status: 400, body: 'Specify an id or name field'};
      context.log.error('addToUniqueRequestsCosmoDB: Error', context.res);
      return;
    }

    const message = {id, age};
  
    context.bindings.newRequestsQueue = message;
  
    context.res = { body: message};

    context.log.verbose('addToNewRequestsQueue: End', message);
}