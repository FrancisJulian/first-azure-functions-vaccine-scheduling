module.exports = async function (context, myTimer) {
    var timeStamp = new Date().toISOString();
    
    if (myTimer.isPastDue)
    {
        context.log('Every5MinutesTrigger: Late');
    }
    context.log.verbose('every5MinutesTrigger: End', timeStamp);   
};