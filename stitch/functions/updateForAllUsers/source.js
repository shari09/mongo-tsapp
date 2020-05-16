const update = async () => {
  const db = context.services.get('tsapp-service').db('tsapp');
  const users = await db
    .collection('users')
    .find({
      notificationEnabled: true,
      loggedIn: true,
    })
    .toArray();
  const asyncFunc = users.map((user) => async () => {
    await context.functions.execute('run', user._id);
  });
  await asyncFunc.reduce(async (prevPromise, nextFunc) => {
    await prevPromise;
    await nextFunc();
  }, Promise.resolve());
};

exports = update;
