/**
 * riskante Tests zuerst
 * langsame Tests zum Schluss
 * vor dem Bug fixen neuen Test schreiben 
 */

import IndexPage from './page-model';
const page = new IndexPage();
var ping = require('ping');
var hostReachable;

var host = '141.19.142.8';

ping.sys.probe(host, isAlive => {
  hostReachable = isAlive ? true : false;
})

fixture `ServerAvailable`
  .page('http://localhost:8080/')

test('Test if Server is alive', async t => {
  await t.expect(hostReachable).eql(true);
});



fixture `Login`
  .page('http://localhost:8080/')

test('Login without credentials', async t => {
  await t
    .click(page.loginButton)
  const location = await t.eval(() => window.location)
  await t.expect(location.pathname).eql('/login');
});
test('Login with credentials', async t => {
  await t
    .typeText(page.accountIDInput, 'TestAccount')
    .typeText(page.UsernameInput, 'TestUser')
    .typeText(page.PasswordInput, 'TestPassword')
    .click(page.loginButton);
});



fixture `Reload page`
  .page('http://localhost:8080/')
  .beforeEach(async t => {
    await t
      .typeText(page.accountIDInput, 'TestAccount')
      .typeText(page.UsernameInput, 'TestUser')
      .typeText(page.PasswordInput, 'TestPassword')
      .click(page.loginButton);
  });
test('Reload page to check if stay logged in', async t => {
  await t.eval(() => location.reload(true));
  const location = await t.eval(() => window.location)
  await t.expect(location.pathname).eql('/overview');
});



fixture `HeaderMenu`
  .page('http://localhost:8080/')
  .beforeEach(async t => {
    await t
      .typeText(page.accountIDInput, 'TestAccount')
      .typeText(page.UsernameInput, 'TestUser')
      .typeText(page.PasswordInput, 'TestPassword')
      .click(page.loginButton);
  });
test('Check if HeaderMenu is gone after Logout', async t => {
  await t
    .click(page.menuButton)
    .click(page.linkLogoutCorner)
  const location = await t.eval(() => window.location)
  await t.expect(location.pathname).eql('/login')
  await t.expect(page.headerMenu.exists).eql(false);
});



fixture `LogoutCall from Overview`
  .page('http://localhost:8080/')
  .beforeEach(async t => {
    await t
      .typeText(page.accountIDInput, 'TestAccount')
      .typeText(page.UsernameInput, 'TestUser')
      .typeText(page.PasswordInput, 'TestPassword')
      .click(page.loginButton);
  });
test('URL test Logout from Overview via linkLogoutCorner', async t => {
  await t
    .click(page.menuButton)
    .click(page.linkLogoutCorner)
  const location = await t.eval(() => window.location)
  await t.expect(location.pathname).eql('/login');
});



fixture `CreateCall`
  .page('http://localhost:8080/')
  .beforeEach(async t => {
    await t
      .typeText(page.accountIDInput, 'TestAccount')
      .typeText(page.UsernameInput, 'TestUser')
      .typeText(page.PasswordInput, 'TestPassword')
      .click(page.loginButton);
  });
test('URL test to reach Create from Overview', async t => {
  await t
    .click(page.menuButton)
    .click(page.linkCreate);
  const location = await t.eval(() => window.location)
  await t.expect(location.pathname).eql('/create');
});



fixture `Create Bot`
  .page('http://localhost:8080/')
  .beforeEach(async t => {
    await t
      .typeText(page.accountIDInput, 'TestAccount')
      .typeText(page.UsernameInput, 'TestUser')
      .typeText(page.PasswordInput, 'TestPassword')
      .click(page.loginButton);
  });
test('Cancel creating bot expecting bot was not created', async t => {
  await t
    .click(page.linkCreate)
    .click(page.welcomeSelector)
    .click(page.createNext)
    .typeText(page.botNameInput, '!testCafeBot!')
    .click(page.backButtonCreate)
    .click(page.cancerCreate)
    .expect(page.error.exists).notOk('Found error')
  const location = await t.eval(() => window.location)
  await t
    .expect(location.pathname).eql('/overview')
    .expect(page.testCafeBot.exists).eql(false)
});
test('Not possible to create WelcomeBot without name', async t => {
  await t
    .click(page.linkCreate)
    .click(page.welcomeSelector)
    .click(page.createNext)
    .click(page.saveButtonFinal)
  await t
    .expect(page.error.exists).ok('Found error');
});
test('Create Test WelcomeBot and check if it gets saved @ create allready', async t => {
  await t
    .click(page.linkCreate)
    .click(page.welcomeSelector)
    .click(page.createNext)
    .typeText(page.botNameInput, '!testCafeBotCreate!')
    .click(page.saveButtonFinal)
    .expect(page.error.exists).notOk('Found error')
    .click(page.overviewRefer)
  const location = await t.eval(() => window.location)
  await t
    .expect(location.pathname).eql('/overview')
    .expect(page.testCafeBotCreate.exists).eql(true)
    .click(page.testCafeBotCreate)
    .click(page.deleteButton)
    .click(page.confirmDelete)
});
test('Create WelcomeBot and delete Name in config not possible', async t => {
  await t
    .click(page.linkCreate)
    .click(page.welcomeSelector)
    .click(page.createNext)
    .typeText(page.botNameInput, '!deleteNameBot!')
    .click(page.saveButtonFinal)
    .expect(page.error.exists).notOk('Found error')
    .click(page.overviewRefer)
    .click(page.deleteNameBot)
    .click(page.editButton)
    .click(page.botNameInput)
    .pressKey('ctrl+a delete')
    .click(page.saveButtonConfig)
    .expect(page.error.exists).ok('Found error')
    .click(page.error)
    .click(page.linkOverview)
    .click(page.deleteNameBot)
    .click(page.deleteButton)
    .click(page.confirmDelete)
});
test('Create Test WelcomeBot full process', async t => {
  await t
    .click(page.linkCreate)
    .click(page.welcomeSelector)
    .click(page.createNext)
    .typeText(page.botNameInput, '!testCafeBot!')
    .click(page.saveButtonFinal)
    .expect(page.error.exists).notOk('Found error')
    .click(page.overviewRefer)
  const location = await t.eval(() => window.location)
  await t.expect(location.pathname).eql('/overview');
});



fixture `BotStatus Check` 
  .page('http://localhost:8080/')
  .beforeEach(async t => {
    await t
      .typeText(page.accountIDInput, 'TestAccount')
      .typeText(page.UsernameInput, 'TestUser')
      .typeText(page.PasswordInput, 'TestPassword')
      .click(page.loginButton);
  });
test('Runnable bot check', async t => {
    await t
      .click(page.testCafeBot)
      .expect(page.statusRunnable.exists).eql(true)
      .expect(page.startButton.exists).eql(true)
      .expect(page.editButton.exists).eql(true)
      .expect(page.deleteButton.exists).eql(true)    
  }),
  test('Check if Bot changes Status to running', async t => {
    await t
      .click(page.testCafeBot)
      .click(page.startButton)
      .wait(3000)
      .expect(page.statusRunning.exists).eql(true)
  });
test('Not possible to reach edit @ running bot', async t => {
    await t
      .click(page.testCafeBot)
      .expect(page.statusRunning.exists).eql(true)
      .expect(page.editButtonDisabled.exists).eql(true)
  }),
  test('Check if Bot changes Status to stop', async t => {
    await t
      .click(page.testCafeBot)
      .click(page.stopButton)
      .wait(10000)
      .expect(page.statusStopped.exists).eql(true)
  }),




  fixture `Logout from Config`
  .page('http://localhost:8080/')
  .beforeEach(async t => {
    await t
      .typeText(page.accountIDInput, 'TestAccount')
      .typeText(page.UsernameInput, 'TestUser')
      .typeText(page.PasswordInput, 'TestPassword')
      .click(page.loginButton);
  });
test('URL test to Logout from Config via linkLogoutCorner', async t => {
  await t
    .click(page.testCafeBot)
    .click(page.editButton)
    .click(page.menuButton)
    .click(page.linkLogoutCorner)
  const location = await t.eval(() => window.location)
  await t.expect(location.pathname).eql('/login');
});



fixture `Delete Testbot`
  .page('http://localhost:8080/')
  .beforeEach(async t => {
    await t
      .typeText(page.accountIDInput, 'TestAccount')
      .typeText(page.UsernameInput, 'TestUser')
      .typeText(page.PasswordInput, 'TestPassword')
      .click(page.loginButton);
  });

test('Try delete Running bot', async t => {
    await t
      .click(page.testCafeBot)
      .click(page.startButton)
      .wait(3000)
      .expect(page.stopButton.exists).eql(true)
      .expect(page.disabledDelete.exists).eql(true)
  }),
  test('Cancel delete process => bot shouls still exist ', async t => {
    await t
      .click(page.testCafeBot)
      .click(page.stopButton)
      .wait(6000)
      .click(page.testCafeBot)
      .click(page.deleteButton)
      .click(page.abortDelete)
      .expect(page.testCafeBot.exists).eql(true);
  }),
  test('Try delete Stopped bot', async t => {
    await t
      .click(page.testCafeBot)
      .click(page.deleteButton)
      .click(page.confirmDelete)
      .expect(page.testCafeBot.exists).eql(false)

  });



fixture `Config Call`
  .page('http://localhost:8080/') //creating new bot here to be able to reach the edit button
  .beforeEach(async t => {
    await t
      .typeText(page.accountIDInput, 'TestAccount')
      .typeText(page.UsernameInput, 'TestUser')
      .typeText(page.PasswordInput, 'TestPassword')
      .click(page.loginButton)
      .click(page.linkCreate)
      .click(page.welcomeSelector)
      .click(page.createNext)
      .typeText(page.botNameInput, '!testCafeBot!')
      .click(page.saveButtonFinal)
      .click(page.overviewRefer)
  });
test('Check if config is reachable via edit button', async t => {
  await t
    .click(page.testCafeBot)
    .click(page.editButton);
  const location = await t.eval(() => window.location)
  await t.expect(location.pathname).contains('/config');
});



fixture `Edit Bot`
  .page('http://localhost:8080/')
  .beforeEach(async t => {
    await t
      .typeText(page.accountIDInput, 'TestAccount')
      .typeText(page.UsernameInput, 'TestUser')
      .typeText(page.PasswordInput, 'TestPassword')
      .click(page.loginButton);
  });
test('Edit test Bot change name', async t => {
  await t
    .click(page.testCafeBot)
    .click(page.editButton)
    .click(page.botNameInput)
    .pressKey('ctrl+a delete')
    .typeText(page.botNameInput, '!botEdited!')
    .click(page.saveButtonConfig)
    .click(page.successBar)
    .expect(page.error.exists).notOk('Found error')
    .click(page.linkOverview)
    .expect(page.botEdited.exists).eql(true)
});
test('Does the old name get saved', async t => {
  await t
    .click(page.botEdited)
    .click(page.editButton)
    .click(page.botNameInput)
    .click(page.saveButtonConfig)
    .click(page.successBar)
  await t
    .expect(page.error.exists).notOk('Found error')
  await t
    .click(page.linkOverview)
    .expect(page.botEdited.exists).eql(true)
});
test('Does empty name get saved', async t => {
  await t
    .click(page.botEdited)
    .click(page.editButton)
    .click(page.botNameInput)
    .pressKey('ctrl+a delete')
    .click(page.saveButtonConfig)
  await t
    .expect(page.error.exists).ok('Found error')
    .click(page.error)
    .click(page.linkOverview)
    .expect(page.botEdited.exists).eql(true)
});



fixture `Edit Bot flowchart`
  .page('http://localhost:8080/')
  .beforeEach(async t => {
    await t
      .typeText(page.accountIDInput, 'TestAccount')
      .typeText(page.UsernameInput, 'TestUser')
      .typeText(page.PasswordInput, 'TestPassword')
      .click(page.loginButton);
  });
test.skip('Edit test Bot, create node', async t => {
  await t
    .click(page.botEdited)
    .click(page.editButton)
    .typeText(page.botInput, 'testyTestInitial')
    .click(page.editNode)
    .expect(page.node.exists).eql(true)
    .click(page.saveButtonConfig)
    .expect(page.node.exists).eql(true)
    .expect(page.error.exists).notOk('Found error')
});
test.skip('Edit test Bot, extend node', async t => {
  await t
    .click(page.botEdited)
    .click(page.editButton)
    .click(page.appendButton)
    .typeText(page.botInput, 'testyTestBot')
    .typeText(page.userInput, 'testyTestUser')
    .click(page.editNode)
    .click(page.saveButtonConfig)
    .expect(page.nodeTwo.exists).eql(true)
    .expect(page.error.exists).notOk('Found error')
});
test.skip('Edit test Bot, delete node', async t => {
  await t
    .click(page.botEdited)
    .click(page.editButton)
    .click(page.deleteNode)
    .click(page.saveButtonConfig)
    .expect(page.nodeTwo.exists).eql(false)
    .expect(page.error.exists).notOk('Found error')
    .click(page.botEdited)
    .click(page.deleteButton)
    .click(page.confirmDelete)
});
