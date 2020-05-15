const verifyUser = async (username, password) => {
  try {
    console.log(`logging in as ${username}`);
    const res = await context.http.post({
      url: `https://ta.yrdsb.ca/yrdsb/index.php?username=${username}&password=${password}`,
      followRedirects: true
    });
    homePage = res.body.text();
  } catch (e) {
    console.log(e);
  }
  if (homePage.includes('Invalid Login')) {
    return false;
  }
  return true;
};

const login = async loginPayload => {
  const userCollection = context.services.get('tsapp-service').db('tsapp').collection('users');
  const {
    username,
    password
  } = loginPayload;
  const user = await userCollection.findOne({
    username: username
  });

  if (user) {
    return user._id.toString();
  }

  if (await verifyUser(username, password)) {
    const res = await userCollection.insertOne({
      username: username,
      password: password,
      loggedIn: true,
      notificationEnabled: true,
      precision: 2,
      displayName: username,
      animationEnabled: true
    });
    return res.insertedId.toString();
  }

  return null;
};

exports = login;