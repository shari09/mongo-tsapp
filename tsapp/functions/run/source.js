const getFromTa = async(rp, auth) => {
  console.log(`logging in as ${auth.username}...`);
  const session = rp.jar();

  try {
    const homePage = await rp.post({
      url: "https://ta.yrdsb.ca/yrdsb/index.php",
      jar: session,
      form: auth,
      followAllRedirects: true
    });
    console.log(homePage);
    return homePage;
  } catch (e) {
    throw e;
  }
};
  
  
exports = async() => {
  const rp = require('request-promise-native');
  const db = context.services.get('tsapp-service').db('tsapp');

  const user = await db.collection('users').findOne({username: "349175448"});

  const taData = await getFromTa(rp, {
    username: user.username, 
    password: user.password
  });

  console.log(JSON.stringify(taData));
};