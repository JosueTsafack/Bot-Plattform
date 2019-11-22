
const mutations = require('../../client/store/mutations');
var expect = require('chai').expect




describe('mutations', () => {

    it('Delete Bot from Array which exists', () => {
        const state = { model: { bots: [{ BotId: 15 }] } }
        mutations.deleteBotFromArray(state, 15);
        expect(state.model.bots).to.be.empty;
    })

    it('Delete Bot from Array which doesnt exists', () => {
        const state = { model: { bots: [{ BotId: 15 }] } }
        mutations.deleteBotFromArray(state, 1);
        expect(state.model.bots[0].BotId).to.equal(15);
    })
})

