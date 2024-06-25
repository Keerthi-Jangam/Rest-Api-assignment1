import express, { Request, Response } from "express";
import bodyParser from 'body-parser';
import {User,Provider, Meter,reading} from './Models'


const app = express()
const port = 3000
app.use(express.json());
app.use(bodyParser.json());

//Task-7
const requestCount = new Map<string, {count:number,resetTime: number}>();
function limitRequests(req:Request, res:Response, next:Function){
    const userId=req.headers['user-id'] as string;
    if(!requestCount.has(userId)){
        requestCount.set(userId,{count:0,resetTime:Date.now()+60000});
    }
    const {count,resetTime} = requestCount.get(userId)!;
    if(Date.now()>resetTime){
        requestCount.set(userId,{count:0,resetTime:Date.now()+60000});
    }
    requestCount.get(userId)!.count++;
    if(requestCount.get(userId)!.count>1000){
        return res.status(429).send('Too many requests');
    }
    next();
}
app.use('/',limitRequests);

const findById = (array : any, id : any) => array.find((item:any) => item.id === parseInt(id));
const users : User[]=[];
let providers: Provider[] =[new Provider(1,"Electro",5),new Provider(2,"Magneto",10)]
const adminId :number=10002;
//task -6 
interface userDTO {
    id: number,
    userName: string,
    email : string;
    fullName: string;
}

const mapDTO = (user: User) : userDTO => {
    const {id,userName,email,fullName} = user;
    return {id,userName,email,fullName}
}

const getUsers = (users: User[]) : userDTO[] => {
    return users.map(user=>mapDTO(user));
} 

//task - 1 Authentication
const authenticateAdmin = (req: Request, res: Response,next:Function) => {
    const header=req.headers['authorization']
    if(!header){
        res.send("No authetication details provided");
        return;
    }
    const id = header.split(' ')[1];
    if(parseInt(id as string)===adminId){
        next();
    }
    else{
        res.status(401).send('Unauthorized');
    }
};

const authenticateUser = (req: Request, res: Response, next:Function) => {
    const requestedUserId = parseInt(req.params.id)
    const header=req.headers['authorization']
    if(!header){
        res.send("No authetication details provided");
        return;
    }
    const id = header.split(' ')[1];
    if (id && parseInt(id) === requestedUserId) {
        next(); 
    } else {
        res.status(401).send('Unauthorized');
    }
};

const authenticateProvider =  (req: Request, res: Response, next:Function) => {
    const requestedProviderId = parseInt(req.params.id)
    const header=req.headers['authorization']
    if(!header){
        res.send("No authetication details provided");
        return;
    }
    const id = header.split(' ')[1];
    if (id && parseInt(id) === requestedProviderId) {
        next(); 
    } else {
        res.status(401).send('Unauthorized');
    }
}

// Return all users
app.get('/users', authenticateAdmin,(req, res) => {
    //task-5 paging
    const page = parseInt(req.query.page as string)
    const limit = parseInt(req.query.limit as string)
    console.log(page)
    console.log(limit)
    if(!page && !limit){
        res.send(getUsers(users)); //Calling getUsers to get only specific information
    }
    const index = (page-1)*limit;
    const limitedUsers = users.slice(index,index+limit);
    res.send(getUsers(limitedUsers));
    
});

app.get('/users/:id',authenticateUser, (req, res) => {
    const id = req.params.id;
    const user =findById(users,id)
    if(user){
        res.json(mapDTO(user));
    }else{
        res.status(404).send("User not found")
    }
});

app.post('/users', (req: Request, res: Response) => {
    const id = users.length+1;
    const username =  req.body.username;
    const password = req.body.password
    const email = req.body.email;
    const fullname = req.body.fullname;
    const newUser = new User(id,username,password,email,fullname)
    users.push(newUser);
    res.send("User Added Succesfully")
});

app.put('/users/:id', authenticateUser,(req, res) => {
    const id = req.params.id;
    let user =findById(users,id)
    if(user){
        console.log(req.body)
        user = {...user,...req.body}
        res.send("Updated succesfully")
    }
    else{
        res.send("User Not found, cant update")
    }
});

app.delete('/users/:id', authenticateUser,(req, res) => {
    const id = parseInt(req.params.id);
    const userIndex = users.findIndex(item => item.id === id);

    if (userIndex !== -1) {
        users.splice(userIndex, 1);
        res.send("User deleted successfully");
    } else {
        res.send("User not found");
    }
});


app.get('/providers', authenticateAdmin,(req,res)=>{
    res.send(providers)
});
app.get('/providers/:id', authenticateProvider, (req, res) => {
    const id = req.params.id;
    const provider =findById(providers,id)
    if(provider){
        res.json(provider);
    }else{
        res.send("Provider not found")
    }
});
app.post('/providers',(req,res)=>{
    const id = providers.length+1;
    const name =  req.body.name;
    const charge = req.body.charge
    const newProvider = new Provider(id,name,charge)
    providers.push(newProvider);
    res.send("Provider Added Succesfully")
})
app.put('/providers/:id',authenticateProvider,(req,res)=>{
    const id = req.params.id;
    const provider =findById(providers,id)
    if(provider){
        const name = req.body.name;
        const charge = req.body.charge;
        if(name){ provider.name = name}
        if(charge){provider.charge}
        res.send("Updated Succesfully")
    }
    else{
        res.send("Provider Not found, cant update")
    }
})
app.delete('/providers/:id', authenticateProvider,(req, res) => {
    const id = parseInt(req.params.id);
    const providerIndex = providers.findIndex(item => item.id === id);

    if (providerIndex !== -1) {
        providers.splice(providerIndex, 1);
        res.send("Provider deleted successfully");
    } else {
        res.send("Provider not found");
    }
});

app.post('/users/:id/providerSubscription', authenticateUser,(req,res)=>{
    const id = req.params.id;
    const user =findById(users,id)
    const providerId = req.body.providerId;
    const provider =findById(providers,providerId)
    if(user && provider){
        user.providerId = providerId;
        res.json(user);
    }
    else{
        res.send("Provider or User Not Found");
    }
})

const meters : Meter[] = []//[new Meter(1,"Meter1",meter1Readings)]
app.get('/meters',(req,res)=>{
    res.json(meters);
})

app.post('/meters',(req,res)=>{
    const id = meters.length+1;
    const name = req.body.name;
    const newMeter = new Meter(id,name,[]);
    meters.push(newMeter);
    res.send("Meter Created Successfully");
})

app.post('/user/:id/meterSubscription', authenticateUser,(req,res)=>{
    const id = req.params.id;
    const user =findById(users,id);
    const meterId = req.body.meterId
    if(user){
        user.meterId = meterId;
        res.send("Updated Meter Succesfully")
    }
    else{
        res.send("User Not Found")
    }
})

app.post('/meters/:id/readings',(req,res)=>{
    const id = req.params.id;
    const meter =findById(meters,id)
    if(meter){
        const units = req.body.units;
        const time = req.body.time;
        const newreadings : reading = {
            units : units,
            time : time,
        } 
        meter.readings.push(newreadings);
        console.log(" Updated Succesfully");
        res.send("Updated Succesfully")
    }
    else{
        res.send("Meter Not Found");
    }
})


const getUnitsConsumed = (readings: reading[],days:number=0) : number=> {
    const currentDate = new Date();
    if(days===0){
        days=readings.length
    }
    const startDate = new Date(currentDate.getTime() - days * 24 * 60 * 60 * 1000);
    let totalUnits = 0;

    for (let reading of readings) {
        const readingTime = new Date(reading.time);
        if (readingTime >= startDate && readingTime <= currentDate) {
            console.log("inside",reading);
            totalUnits += reading.units;

        }
    }
    return totalUnits;  
};
//console.log(getUnitsConsumed(meter1Readings,5));

const getUnitsInBillingCycle = (readings: reading[]): any => {
    const currentDate = new Date();
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 2);
    console.log(firstDay)
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    console.log(lastDay)
    let totalUnits = 0;

    for (let reading of readings) {
        const readingTime = new Date(reading.time);
        if (readingTime >= firstDay && readingTime <= lastDay) {
            console.log("inside",reading);
            totalUnits += reading.units;
        }
    }
    const output = {
        firstDay : firstDay,
        lastDay : lastDay,
        units: totalUnits 
    }
    return output
};

// console.log(getUnitsInBillingCycle(meter1Readings));
//task-4 - top3 providers
app.get('/users/:id/top3Providers', authenticateUser, (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const user =findById(users,id)
    if(!user){
        return res.status(404).send('User not found');
    }
    const userMeter = meters.find(meter=>meter.id===user.meterId)
    if (!userMeter) {
        return res.status(404).send('User meters not found');
    }
    const totalUnitsConsumed = getUnitsConsumed(userMeter.readings);

    const providersCharges = providers.map(provider=>({
        name:provider.name,
        amount:totalUnitsConsumed* provider.charge
    }))

    const providersSorted = providersCharges.sort((a,b)=>a.amount-b.amount)
    const top3Providers = providersSorted.slice(0,3);

    res.send(top3Providers);
})
//"/users/:id/unitsConspumption?limit=10"
//Task - 2: UnitsCalculation
app.get('/users/:id/unitsConspumption', authenticateUser, (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const limit = parseInt(req.query.limit as string);
    if (isNaN(limit) || limit <= 0) {
        return res.status(400).send('Invalid limit parameter');
    }
    const userMeter = meters.find(meter => meter.id === id);

    if (!userMeter) {
        return res.status(404).send('User meters not found');
    }
    const unitsConsumed = getUnitsConsumed(userMeter.readings, limit);

    const output = {
        userId: id,
        limit: limit,
        unitsConsumed: unitsConsumed,
    };

    res.json(output);
});

//Task-3 : Billing cycle
app.get('/users/:id/unitsConsumptionCycle', authenticateUser, (req: Request,res: Response)=>{
    const id = parseInt(req.params.id, 10);
    const user =findById(users,id)
    if(!user){
        return res.status(404).send('User not found');
    }
    const userMeter = meters.find(meter=>meter.id===user.meterId)
    if (!userMeter) {
        return res.status(404).send('User meters not found');
    }
    const output = getUnitsInBillingCycle(userMeter.readings);
    output.userId = id;
    res.json(output);
    
});


app.get('/users/:id/bill',(req,res)=>{
    const id = req.params.id;
    const user =findById(users,id)
    if(user){
        const provider = providers.find(item=>item.id===user.providerId)
        const userMeter = meters.find(meter=>meter.id===user.meterId)
        if(userMeter){
            const userReadings = userMeter.readings
            const totalUnits = userReadings.reduce((sum, reading) => sum + reading.units, 0);
            const amount = totalUnits * (provider ? provider.charge : 0);
            const op={
                "user ID": user.id,
                "amount": amount,
            }
            res.json(op);
        }
        else{
            res.send("User not found");
        }
    }
    else{
        res.send("No user found")
    }
})

app.listen(port, () => {
    console.log(`server is running on port http://localhost:${port}`)
})