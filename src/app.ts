import express, { Request, Response } from "express";

const app = express();
const port = 3000;

app.use(express.json());

let users: any[] = [];
let providers: any[] = [];
let meters: any[] = [];
let meterReadings: any[] = [];
let totalBillArray: any[] = [];
function findOne(array: any, id: any) {
  return array.findIndex((item: any) => item.id == id);
}

//Task1
// Return all users
app.get("/users", (req: Request, res: Response) => {
  res.send(users);
});

// Create a user with attributes username, password, email and fullname
app.post("/users", (req: Request, res: Response) => {
  users.push({
    id: users.length + 1,
    userName: req.body.userName,
    password: req.body.password,
    email: req.body.email,
    fullname: req.body.fullname,
    readings: req.body.readings,
    charge: req.body.charge,
  });

  res.send(users);
  // use req.body
});

// Return a user with parameter id if not exists return message saying `user not found`
app.get("/users/:id", (req: Request, res: Response) => {
  users.find((item: any) => {
    if (item.id == req.params.id) {
      res.send("user found");
    } else res.send("user not found");
  });
});

// update user information for given id
app.put("/users/:id", (req: Request, res: Response) => {
  users.find((item: any) => {
    if (item.id == req.params.id) {
      item.userName = req.body.userName;
    }
  });
  res.send(users);
});

// delete user for given id
app.delete("/users/:id", (req: Request, res: Response) => {
  const id = req.params.id;
  const delIndex = users.indexOf((item: any) => item.id == id);

  if (delIndex) {
    users.splice(delIndex + 1, 1);
  }
  res.send(users);
});

//Task2
//create provider
app.post("/providers", (req: Request, res: Response) => {
  providers.push({
    id: providers.length + 1,
    name: req.query.name,
    charge: req.body.charge,
  });
  res.send(providers);
});

//get providers
app.get("/providers", (req: Request, res: Response) => {
  res.send(providers);
});
//update providers
app.put("/providers/:id", (req: Request, res: Response) => {
  providers.find((item: any) => {
    if (item.id == req.params.id) {
      item.name = req.body.providerName;
    }
  });
  res.send(providers);
});

//delete provider
app.delete("/providers/:id", (req: Request, res: Response) => {
  const id = req.params.id;
  const delIndex = providers.indexOf((item: any) => item.id == id);

  if (delIndex) {
    providers.splice(delIndex + 1, 1);
  }
  res.send(providers);
});

//Task 3
//Create APIs for user subscribing to providers user can choose any one provider
app.post("/subscribe/:id", (req: Request, res: Response) => {
  const id = req.params.id;
  const providerId = req.body.id;

  const matchingProvider = providers.find((item: any) => {
    if (item.id == providerId) {
      return item.id;
    }
  });

  users.map((item: any) => {
    if (item.id == id) {
      item.subscribe = matchingProvider.id;
    }
  });
  res.send(users);
});

//Task4
//create meters
app.post("/meters", (req: Request, res: Response) => {
  meters.push({
    id: meters.length + 1,
    Name: req.query.name,
    readings: req.body.readings,
  });
  res.send(meters);
});

//store meter readings
app.post("/meters/1/readings", (req: Request, res: Response) => {
  meters.map((meter) => {
    meterReadings.push({ units: meter.readings });
  });
  res.send(meterReadings);
});

//get all meter readings
app.get("/meters/1/readings", (req: Request, res: Response) => {
  res.send(meterReadings);
});

//Task 5
//A meter will be associated with user i.e., a meter belongs to a user
//Create an API to return all readings of given user id
app.post("/userReadings/:id", (req: Request, res: Response) => {
  const id = req.params.id;
  const meterId = req.body.id;
  const userIdIndex = findOne(users, id);
  const macthingMeterIdIndex = findOne(meters, meterId);

  users[userIdIndex].readings = meters[macthingMeterIdIndex].readings;
  res.send(users[userIdIndex].readings);
});

//Create an API to return bill for given user id
app.post("/userBill/:id", (req: Request, res: Response) => {
  const userId = req.params.id;
  console.log(userId);
  const meterId = req.body.meterId;
  console.log(meterId);
  const providerId = req.body.providerId;
  console.log(providerId);
  const userIdIndex = findOne(users, userId);
  const macthingMeterIdIndex = findOne(meters, meterId);
  const matchingProviderIdIndex = findOne(providers, providerId);
  users[userIdIndex].charge = providers[matchingProviderIdIndex].charge;
  users[userIdIndex].readings = meters[macthingMeterIdIndex].readings;
  let chargeOfUser = users[userIdIndex].charge;

  const totalUnitsOfUser = users[userIdIndex].readings.reduce(
    (sum: any, item: any) => {
      return (sum = sum + item.units);
    },
    0
  );

  let totalBill = chargeOfUser * totalUnitsOfUser;
  console.log("totalBill", totalBill);
  totalBillArray.push({ user_id: userId, amount: totalBill });
  res.send(totalBillArray);
});

app.listen(port, () => {
  console.log(`server is running on port http://localhost:${port}`);
});
