[github.com/francisjulian/first-azure-functions-vaccine-scheduling](github.com/francisjulian/first-azure-function-app-vaccine-scheduling)
  

#  Vaccine scheduling: My first Azure Functions app to solve a simple problem with a huge burst of users

## Motivation

Traditionally, our group has focused on big, complex decision support apps used by a small number of users (10s to 100s) working all day.

In this example, focus on a simple app where a 100,000 users appear within a minute.

## Vaccine scheduling app

In the included Word document, I wrote about the vaccine scheduling apps in the US where every major pharmacy and medical systems
apps were not built correctly for a huge push of people trying to schedule an appointment. 

In one case, someone was tweeting
 every time an appointment came available, and then 100,000 people would all try to get on within minutes.
The inital web sites were not technically designed correctly to have such a sudden rush of people and crashed 
repeatedly.

## Approach

With this motivation, the goal of this project is to write my first Azure Functions.  Functions promise to be able to handle 
a big rush of people all doing a simple task quickly. 

I found it easier to first work within the Azure Portal to build an example and then to build locally. 

## Solution

1. An Azure Function that takes an http Post 
``` 
{
  "email": "youremail@company.com", -- proxy for ID and to allow follow up
  "age": 96                         -- proxy for health priority
}
```
that immediately puts on the **Azure Storage Queue** and then the function returns.  

> The goal of using the queue is to allow large number of users, so we very often get back to the person even if the main processing is delayed.  The initial function will be as short as possible so that as many as possible of the huge crush of users will at least be recorded in our database.  All the other steps can be done more slowly.

> Even with serverless, of course over some crushes of users will be too many.  If this initial function is not able to keep up, Azure Functions puts rejected requests in a -poison queue.

2. A second Azure function is asynchronously triggged from the queue and writes to a **Cosmo Database** to generate unique requests.

3. A third function would be asynchronously triggered from Cosmo to do actual work within a managed SQL database to have the actual ACID guarantees that we need and not available in Cosmo DB. (*Not implemented*)  This function can be slow and delayed in time.

4. A fourth Azure function trigger that checks the queue size every 5 minutes and logs queue size.

# Working in the Azure Portal

1. Create your own personal Azure account.  Unfortunately, the company training account currently is too locked down to be useful.
1. **Important**: In the [Azure Portal](https://portal.azure.com/#home),
   set a budget in your account (ex: not more than $25 in a year).  
1. Set an alert as you hit 50% of your budget.  I accidentally spent $25 in a few days
1. Do the [Microsoft tutorial](https://docs.microsoft.com/en-us/azure/azure-functions/functions-create-function-app-portal) where you make your first function within the Azure Portal.  Also in this step you will create your Function App that will 
       be used below.
   This saves you from having to install locally at first.
   
> In Create Function App, I recommend:
> * the same name to all the resources created in this step.
>   * This way it is clear which storage container goes with which function app.      
> * choose a name with only lower case letters and numbers because of naming restrictions  

In the dialog you see a "Create new" Function App, choose:  
  vaccine0909 for resource group   
  vaccine0909 for Function App name    
  Node.js for Runtime stack   
  16 LTS for Version  
  East US for Region  
  vaccine0909 for storage account  
  **Consumption Serverless**.   
  Yes for Enable Application Insights  
  vaccine0909 for Application Insights  

> I originally selected Functions Premimum -- but that costs $5 per day which obviously is $150 per month.  There is no warning here about the expense when you are going through the dialog.
5. Next in the tutorial, create your first http trigger function and test. 
6. Next do the [Microsoft tutorial to add an output queue to your trigger function](
      https://docs.microsoft.com/en-us/azure/azure-functions/functions-integrate-storage-queue-output-binding?tabs=nodejs).
7. Copy the code in addNewRequestsQueue to the portal
* function.json 
* index.js 
* sample.dat  
      That code can be copied to the portal by choosing index.js and copying and pasting and function.json and copying and pasting
      sample.dat can be copied to the Test/Run dialog
> Portal tends to work asynchrounously, so there is some delay between creating something and seeing on the log tab.  I found putting a version
              number in the code helpful for debugging.

> I like the Monitor tab that allows you to see the runs of each function.

> I found it helpful to create two function apps in Azure portal.  
> * One to edit Functions within the portal
> * Another to deploy from code developed locally and stored in version control. 

8. Now go back to the portal and learn about Cosmos DB
   When you create a new Cosmos DB, there is a quick start page where you can download a sample application.

9. Also created a Azure Load Testing group called
     vaccine0909 in resource gorup vaccine0909
> When you install Load testing you are immediately billed $10 and then given a budget of $10 for testing.

# Working locally

Now that you have experience running and building in the portal, now you can set up your local environment so you can edit locally instead 
  of the portal.  

1. Make sure you have Node 16.x   
    ```nvm install 16
    nvm list
    nvm use 16
2. Install Visual Studio Code
3. Install Code extensions including  
  Azure Functions  
  Azure Databases  
For simplicity, I also installed all other extensions that have the name Azure and are from Microsoft

4. Make sure you have a GitHub account as Microsoft owns GitHub and plays best with this version control.
5. Install additional executables  
  Azure Storage Explorer version 1.25.1  
  Azure Functions Core Tools 4.0.4736 *x64  
  Azure Cosmos DB Emulator  

The web address for the local Cosmo DB is:
https://localhost:8081/_explorer/index.html

6. In the terminal of this project install packages by running
     `npm install`.
7. Set up your local.settings.json (that is not checked into version control):  
 
```
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "MyCosmoDB": "AccountEndpoint=https://localhost:8081/;AccountKey=YOUR_LOCAL_PRIMARY_KEY;",
  }
}
```
Determine YOUR_LOCAL_PRIMARY_KEY for CosmoDB by going to: https://localhost:8081/_explorer/index.html
  and selecting Quickstart and looking at Primary Key. 
  
> The AzureWebJobsStorage allows the Storage Queue to work locally.  The MyCosmoDB key allows the CosmoDB to work locally.

8. Start Azurite by brining up the pallete Control-Shift-P,  
   Azurite: Start  

> Azurite deprecates Azure Storage Emulator running locally.  


9. Connect DB Storage Explorer https://localhost:8081/_explorer/index.html


10. Log into the Azure Portal and configure the CosmoDB connection by
* Go to Configuration
* Add a new Application setting  
```
       Name:   MyCosmoDB  
       Value:  AccountEndpoint=https://vaccine0909.documents.azure.com:443/;AccountKey=YOUR_KEY;  
```

11. Take a break an do the [Microsoft tutorial that explains how to debug locally](      
   https://docs.microsoft.com/en-us/azure/azure-functions/create-first-function-vs-code-node)  
     Example F5 allows you to run locally.   You can edit function and run Azurite storage emulator
     Does not support hot reloading, so each time you change the function you have to restart (so far)

# On start up each day
1. Open Visual Studio Code, 
    Data Storage Explorer    (To view queues)
    CosmosDB Emulator         https://localhost:8081/_explorer/index.html
2. Start Azurite within Visual Studio Code  (Control-Shift P Azurite: Start)
3. Press F5
4. Run function within Workspace on Azure tab



# **Discussion time: What are your lessons?**

> My Lessons so far:
> * Product feels more underdevelopment than expected.  For example:
>   * Tables are not supported locally, so switched to CosmoDB
>   * You can not view inside tables in the Portal
>   * You have to install Azurite, integrated solution in VSCode is deprecated
>   * You have to use Storage Explorer 
> * Easy to burn more money than expected
> * Azure Functions can NOT call other functions, very limited

> **Questions**:
> 1. what other Azure compute levels have you used
> 2. when Not to use Functions?
> 3. Your experience with:
>  *  Durable functions or
>  *  Container Instances  or
>  *  App Service or
>  *  ther compute levels

### More info:

https://docs.microsoft.com/en-us/azure/azure-functions/functions-triggers-bindings?tabs=javascript

Best practices:
https://docs.microsoft.com/en-us/azure/azure-functions/functions-best-practices?tabs=javascript



