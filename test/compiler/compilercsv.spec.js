const fs = require('fs')
const path = require('path')
const assert = require('chai').assert
const Compiler = require('../../src/scripting/CompilerCsv')
const Capabilities = require('../../src/Capabilities')
const DefaultCapabilities = require('../../src/Defaults').Capabilities

const CONVOS_DIR = 'convos/csv'

const buildContext = () => {
  const result = {
    IsAsserterValid: () => false,
    IsUserInputValid: () => false,
    IsLogicHookValid: () => false,
    AddConvos: (c) => {
      result.convos = result.convos.concat(c)
    },
    AddUtterances: (u) => {
      result.utterances = result.utterances.concat(u)
    },
    convos: [],
    utterances: []
  }
  return result
}

describe('compiler.compilercsv', function () {
  describe('ROW_PER_MESSAGE mode, full', function () {
    it('should read basic case', async function () {
      const scriptBuffer = fs.readFileSync(path.resolve(__dirname, CONVOS_DIR, 'convos_sender_basic.csv'))
      const context = buildContext()

      const caps = {}
      const compiler = new Compiler(context, Object.assign({}, DefaultCapabilities, caps))

      compiler.Compile(scriptBuffer, 'SCRIPTING_TYPE_CONVO')
      assert.lengthOf(context.convos, 1)
      assert.equal(context.convos[0].conversation[0].messageText, 'test 1')
      assert.equal(context.convos[0].conversation[0].sender, 'me')
      assert.equal(context.convos[0].conversation[1].messageText, 'test 2')
      assert.equal(context.convos[0].conversation[1].sender, 'bot')
    })
    it('should read different sequence and extra row', async function () {
      const scriptBuffer = fs.readFileSync(path.resolve(__dirname, CONVOS_DIR, 'convos_sender_sequence_and_extra_row.csv'))
      const context = buildContext()

      const caps = {
        [Capabilities.SCRIPTING_CSV_MULTIROW_COLUMN_CONVERSATION_ID]: 'conversationId',
        [Capabilities.SCRIPTING_CSV_MULTIROW_COLUMN_SENDER]: 'sender',
        [Capabilities.SCRIPTING_CSV_MULTIROW_COLUMN_TEXT]: 'text'
      }
      const compiler = new Compiler(context, Object.assign({}, DefaultCapabilities, caps))

      compiler.Compile(scriptBuffer, 'SCRIPTING_TYPE_CONVO')
      assert.lengthOf(context.convos, 1)
      assert.equal(context.convos[0].conversation[0].messageText, 'test 1')
      assert.equal(context.convos[0].conversation[0].sender, 'me')
      assert.equal(context.convos[0].conversation[1].messageText, 'test 2')
      assert.equal(context.convos[0].conversation[1].sender, 'bot')
    })
    it('should read by cap', async function () {
      const scriptBuffer = fs.readFileSync(path.resolve(__dirname, CONVOS_DIR, 'convos_sender_sequence_and_extra_row_no_def_colname.csv'))
      const context = buildContext()

      const caps = {
        [Capabilities.SCRIPTING_CSV_MULTIROW_COLUMN_CONVERSATION_ID]: 'alter conversationId',
        [Capabilities.SCRIPTING_CSV_MULTIROW_COLUMN_SENDER]: 'alter sender',
        [Capabilities.SCRIPTING_CSV_MULTIROW_COLUMN_TEXT]: 'alter text'
      }
      const compiler = new Compiler(context, Object.assign({}, DefaultCapabilities, caps))

      compiler.Compile(scriptBuffer, 'SCRIPTING_TYPE_CONVO')
      assert.lengthOf(context.convos, 1)
      assert.equal(context.convos[0].conversation[0].messageText, 'test 1')
      assert.equal(context.convos[0].conversation[0].sender, 'me')
      assert.equal(context.convos[0].conversation[1].messageText, 'test 2')
      assert.equal(context.convos[0].conversation[1].sender, 'bot')
    })
    it('should read by index', async function () {
      const scriptBuffer = fs.readFileSync(path.resolve(__dirname, CONVOS_DIR, 'convos_sender_sequence_and_extra_row_no_def_colname.csv'))
      const context = buildContext()

      const caps = {
        [Capabilities.SCRIPTING_CSV_MULTIROW_COLUMN_CONVERSATION_ID]: 1,
        [Capabilities.SCRIPTING_CSV_MULTIROW_COLUMN_SENDER]: 0,
        [Capabilities.SCRIPTING_CSV_MULTIROW_COLUMN_TEXT]: 2
      }
      const compiler = new Compiler(context, Object.assign({}, DefaultCapabilities, caps))

      compiler.Compile(scriptBuffer, 'SCRIPTING_TYPE_CONVO')
      assert.lengthOf(context.convos, 1)
      assert.equal(context.convos[0].conversation[0].messageText, 'test 1')
      assert.equal(context.convos[0].conversation[0].sender, 'me')
      assert.equal(context.convos[0].conversation[1].messageText, 'test 2')
      assert.equal(context.convos[0].conversation[1].sender, 'bot')
    })
    it('should read by index, no header', async function () {
      const scriptBuffer = fs.readFileSync(path.resolve(__dirname, CONVOS_DIR, 'convos_sender_no_header.csv'))
      const context = buildContext()

      const caps = {
        SCRIPTING_CSV_SKIP_HEADER: false
      }
      const compiler = new Compiler(context, Object.assign({}, DefaultCapabilities, caps))

      compiler.Compile(scriptBuffer, 'SCRIPTING_TYPE_CONVO')
      assert.lengthOf(context.convos, 1)
      assert.equal(context.convos[0].conversation[0].messageText, 'test 1')
      assert.equal(context.convos[0].conversation[0].sender, 'me')
      assert.equal(context.convos[0].conversation[1].messageText, 'test 2')
      assert.equal(context.convos[0].conversation[1].sender, 'bot')
    })
    it('should read more convos', async function () {
      const scriptBuffer = fs.readFileSync(path.resolve(__dirname, CONVOS_DIR, 'convos_sender_more_convos.csv'))
      const context = buildContext()

      const caps = {}
      const compiler = new Compiler(context, Object.assign({}, DefaultCapabilities, caps))

      compiler.Compile(scriptBuffer, 'SCRIPTING_TYPE_CONVO')
      assert.lengthOf(context.convos, 2)
      assert.equal(context.convos[0].conversation[0].messageText, 'test 1')
      assert.equal(context.convos[0].conversation[0].sender, 'me')
      assert.equal(context.convos[0].conversation[1].messageText, 'test 2')
      assert.equal(context.convos[0].conversation[1].sender, 'bot')
      assert.equal(context.convos[1].conversation[0].messageText, 'test 3')
      assert.equal(context.convos[1].conversation[0].sender, 'me')
      assert.equal(context.convos[1].conversation[1].messageText, 'test 4')
      assert.equal(context.convos[1].conversation[1].sender, 'bot')
    })
    it('should read no text', async function () {
      const scriptBuffer = fs.readFileSync(path.resolve(__dirname, CONVOS_DIR, 'convos_sender_no_text.csv'))
      const context = buildContext()

      const caps = {}
      const compiler = new Compiler(context, Object.assign({}, DefaultCapabilities, caps))

      compiler.Compile(scriptBuffer, 'SCRIPTING_TYPE_CONVO')
      assert.lengthOf(context.convos, 1)
      assert.equal(context.convos[0].conversation[0].messageText, '')
      assert.equal(context.convos[0].conversation[0].sender, 'me')
      assert.equal(context.convos[0].conversation[1].messageText, 'test 2')
      assert.equal(context.convos[0].conversation[1].sender, 'bot')
    })
  })
  describe('QUESTION_ANSWER mode', function () {
    it('should read basic case', async function () {
      const scriptBuffer = fs.readFileSync(path.resolve(__dirname, CONVOS_DIR, 'convos_column_basic.csv'))
      const context = buildContext()

      const caps = {}
      const compiler = new Compiler(context, Object.assign({}, DefaultCapabilities, caps))

      compiler.Compile(scriptBuffer, 'SCRIPTING_TYPE_CONVO')
      assert.lengthOf(context.convos, 1)
      assert.equal(context.convos[0].conversation[0].messageText, 'test 1')
      assert.equal(context.convos[0].conversation[0].sender, 'me')
      assert.equal(context.convos[0].conversation[1].messageText, 'test 2')
      assert.equal(context.convos[0].conversation[1].sender, 'bot')
    })
    it('should read different sequence', async function () {
      const scriptBuffer = fs.readFileSync(path.resolve(__dirname, CONVOS_DIR, 'convos_column_sequence.csv'))
      const context = buildContext()

      const caps = {
        SCRIPTING_CSV_QA_COLUMN_QUESTION: 'question',
        SCRIPTING_CSV_QA_COLUMN_ANSWER: 'answer'
      }
      const compiler = new Compiler(context, Object.assign({}, DefaultCapabilities, caps))

      compiler.Compile(scriptBuffer, 'SCRIPTING_TYPE_CONVO')
      assert.lengthOf(context.convos, 1)
      assert.equal(context.convos[0].conversation[0].messageText, 'test 1')
      assert.equal(context.convos[0].conversation[0].sender, 'me')
      assert.equal(context.convos[0].conversation[1].messageText, 'test 2')
      assert.equal(context.convos[0].conversation[1].sender, 'bot')
    })
    it('should read by name', async function () {
      const scriptBuffer = fs.readFileSync(path.resolve(__dirname, CONVOS_DIR, 'convos_column_sequence_no_def_colname.csv'))
      const context = buildContext()

      const caps = {
        SCRIPTING_CSV_QA_COLUMN_QUESTION: 'alter question',
        SCRIPTING_CSV_QA_COLUMN_ANSWER: 'alter answer'
      }
      const compiler = new Compiler(context, Object.assign({}, DefaultCapabilities, caps))

      compiler.Compile(scriptBuffer, 'SCRIPTING_TYPE_CONVO')
      assert.lengthOf(context.convos, 1)
      assert.equal(context.convos[0].conversation[0].messageText, 'test 1')
      assert.equal(context.convos[0].conversation[0].sender, 'me')
      assert.equal(context.convos[0].conversation[1].messageText, 'test 2')
      assert.equal(context.convos[0].conversation[1].sender, 'bot')
    })
    it('should read by index', async function () {
      const scriptBuffer = fs.readFileSync(path.resolve(__dirname, CONVOS_DIR, 'convos_column_sequence_no_def_colname.csv'))
      const context = buildContext()

      const caps = {
        SCRIPTING_CSV_QA_COLUMN_QUESTION: 1,
        SCRIPTING_CSV_QA_COLUMN_ANSWER: 0
      }
      const compiler = new Compiler(context, Object.assign({}, DefaultCapabilities, caps))

      compiler.Compile(scriptBuffer, 'SCRIPTING_TYPE_CONVO')
      assert.lengthOf(context.convos, 1)
      assert.equal(context.convos[0].conversation[0].messageText, 'test 1')
      assert.equal(context.convos[0].conversation[0].sender, 'me')
      assert.equal(context.convos[0].conversation[1].messageText, 'test 2')
      assert.equal(context.convos[0].conversation[1].sender, 'bot')
    })
    it('should read by index, no header', async function () {
      const scriptBuffer = fs.readFileSync(path.resolve(__dirname, CONVOS_DIR, 'convos_column_no_header.csv'))
      const context = buildContext()

      const caps = {
        SCRIPTING_CSV_SKIP_HEADER: false
      }
      const compiler = new Compiler(context, Object.assign({}, DefaultCapabilities, caps))

      compiler.Compile(scriptBuffer, 'SCRIPTING_TYPE_CONVO')
      assert.lengthOf(context.convos, 1)
      assert.equal(context.convos[0].conversation[0].messageText, 'test 1')
      assert.equal(context.convos[0].conversation[0].sender, 'me')
      assert.equal(context.convos[0].conversation[1].messageText, 'test 2')
      assert.equal(context.convos[0].conversation[1].sender, 'bot')
    })
    it('should read more convos', async function () {
      const scriptBuffer = fs.readFileSync(path.resolve(__dirname, CONVOS_DIR, 'convos_column_more_convos.csv'))
      const context = buildContext()

      const caps = {}
      const compiler = new Compiler(context, Object.assign({}, DefaultCapabilities, caps))

      compiler.Compile(scriptBuffer, 'SCRIPTING_TYPE_CONVO')
      assert.lengthOf(context.convos, 2)
      assert.equal(context.convos[0].conversation[0].messageText, 'test 1')
      assert.equal(context.convos[0].conversation[0].sender, 'me')
      assert.equal(context.convos[0].conversation[1].messageText, 'test 2')
      assert.equal(context.convos[0].conversation[1].sender, 'bot')
      assert.equal(context.convos[1].conversation[0].messageText, 'test 3')
      assert.equal(context.convos[1].conversation[0].sender, 'me')
      assert.equal(context.convos[1].conversation[1].messageText, 'test 4')
      assert.equal(context.convos[1].conversation[1].sender, 'bot')
    })
    it('should read user and bot columns', async function () {
      const scriptBuffer = fs.readFileSync(path.resolve(__dirname, CONVOS_DIR, 'convos_column_me_bot.csv'))
      const context = buildContext()

      const caps = {
        SCRIPTING_CSV_QA_COLUMN_QUESTION: 'user',
        SCRIPTING_CSV_QA_COLUMN_ANSWER: 'bot'
      }
      const compiler = new Compiler(context, Object.assign({}, DefaultCapabilities, caps))

      compiler.Compile(scriptBuffer, 'SCRIPTING_TYPE_CONVO')
      assert.lengthOf(context.convos, 1)
      assert.equal(context.convos[0].conversation[0].messageText, 'test 1')
      assert.equal(context.convos[0].conversation[0].sender, 'me')
      assert.equal(context.convos[0].conversation[1].messageText, 'test 2')
      assert.equal(context.convos[0].conversation[1].sender, 'bot')
    })
  })

  describe('Utterances', function () {
    describe('In legacy mode', function () {
      describe('Utterance mode', function () {
        it('should read oldscool single column format', async function () {
          const scriptBuffer = fs.readFileSync(path.resolve(__dirname, CONVOS_DIR, 'utterances_singlecolumn.csv'))
          const context = buildContext()

          const caps = {}
          const compiler = new Compiler(context, Object.assign({}, DefaultCapabilities, caps))

          compiler.Compile(scriptBuffer, 'SCRIPTING_TYPE_UTTERANCES')
          assert.lengthOf(context.utterances, 1)
          assert.deepEqual(context.utterances[0], {
            name: 'singlecolumn',
            utterances: ['hello', 'hi']
          })
        })
        // maybe we could read it
        it('should NOT read multi column format 3 col', async function () {
          const scriptBuffer = fs.readFileSync(path.resolve(__dirname, CONVOS_DIR, 'utterances_multicolumn3col.csv'))
          const context = buildContext()

          const caps = {}
          const compiler = new Compiler(context, Object.assign({}, DefaultCapabilities, caps))

          compiler.Compile(scriptBuffer, 'SCRIPTING_TYPE_UTTERANCES')
          assert.lengthOf(context.utterances, 0)
          assert.lengthOf(context.convos, 0)
        })
        // maybe we could read it
        it('should NOT read multi column format 5 col', async function () {
          const scriptBuffer = fs.readFileSync(path.resolve(__dirname, CONVOS_DIR, 'utterances_multicolumn5col.csv'))
          const context = buildContext()

          const caps = {}
          const compiler = new Compiler(context, Object.assign({}, DefaultCapabilities, caps))

          compiler.Compile(scriptBuffer, 'SCRIPTING_TYPE_UTTERANCES')
          assert.lengthOf(context.utterances, 0)
          assert.lengthOf(context.convos, 0)
        })
        // maybe we could read it
        it('should NOT read liveperson format with SCRIPTING_CSV_STARTROW', async function () {
          const scriptBuffer = fs.readFileSync(path.resolve(__dirname, CONVOS_DIR, 'utterances_liveperson.csv'))
          const context = buildContext()

          const caps = {
            [Capabilities.SCRIPTING_CSV_UTTERANCE_STARTROW]: 12
          }
          const compiler = new Compiler(context, Object.assign({}, DefaultCapabilities, caps))

          compiler.Compile(scriptBuffer, 'SCRIPTING_TYPE_UTTERANCES')
          assert.lengthOf(context.utterances, 0)
          assert.lengthOf(context.convos, 0)
        })
        // maybe we could read it
        it('should NOT read liveperson format with SCRIPTING_CSV_STARTROWHEADER', async function () {
          const scriptBuffer = fs.readFileSync(path.resolve(__dirname, CONVOS_DIR, 'utterances_liveperson.csv'))
          const context = buildContext()

          const caps = {
            [Capabilities.SCRIPTING_CSV_UTTERANCE_STARTROW_HEADER]: 'SampleSentences'
          }
          const compiler = new Compiler(context, Object.assign({}, DefaultCapabilities, caps))

          compiler.Compile(scriptBuffer, 'SCRIPTING_TYPE_UTTERANCES')
          assert.lengthOf(context.utterances, 0)
          assert.lengthOf(context.convos, 0)
        })
      })
      describe('Convo mode', function () {
        it('should not read oldscool single column format', async function () {
          const scriptBuffer = fs.readFileSync(path.resolve(__dirname, CONVOS_DIR, 'utterances_singlecolumn.csv'))
          const context = buildContext()

          const caps = {}
          const compiler = new Compiler(context, Object.assign({}, DefaultCapabilities, caps))

          compiler.Compile(scriptBuffer, 'SCRIPTING_TYPE_CONVO')
          assert.lengthOf(context.utterances, 0)
        })
        it('should not parse multi column uttrances as convos ???', async function () {
          const scriptBuffer = fs.readFileSync(path.resolve(__dirname, CONVOS_DIR, 'utterances_multicolumn3col.csv'))
          const context = buildContext()

          const caps = {}
          const compiler = new Compiler(context, Object.assign({}, DefaultCapabilities, caps))

          try {
            compiler.Compile(scriptBuffer, 'SCRIPTING_TYPE_CONVO')
            assert.fail('expected error')
          } catch (err) {
            assert.equal(err.message, 'Failed to parse conversation. Section "goodbye" unknown.')
          }
        })
        it('should not parse multi column uttrances as convos ???', async function () {
          const scriptBuffer = fs.readFileSync(path.resolve(__dirname, CONVOS_DIR, 'utterances_multicolumn5col.csv'))
          const context = buildContext()

          const caps = {}
          const compiler = new Compiler(context, Object.assign({}, DefaultCapabilities, caps))

          try {
            compiler.Compile(scriptBuffer, 'SCRIPTING_TYPE_CONVO')
            assert.fail('expected error')
          } catch (err) {
            assert.equal(err.message, 'Failed to parse conversation. Section "goodbye" unknown.')
          }
        })
        it('should NOT read liveperson format with SCRIPTING_CSV_UTTERANCE_STARTROW???', async function () {
          const scriptBuffer = fs.readFileSync(path.resolve(__dirname, CONVOS_DIR, 'utterances_liveperson.csv'))
          const context = buildContext()

          const caps = {
            [Capabilities.SCRIPTING_CSV_UTTERANCE_STARTROW]: 12
          }
          const compiler = new Compiler(context, Object.assign({}, DefaultCapabilities, caps))

          try {
            compiler.Compile(scriptBuffer, 'SCRIPTING_TYPE_CONVO')
            assert.fail('expected error')
          } catch (err) {
            assert.equal(err.message, 'Failed to parse conversation. Section "DisplayName" unknown.')
          }
        })
        it('should NOT read liveperson format with SCRIPTING_CSV_STARTROWHEADER', async function () {
          const scriptBuffer = fs.readFileSync(path.resolve(__dirname, CONVOS_DIR, 'utterances_liveperson.csv'))
          const context = buildContext()

          const caps = {
            [Capabilities.SCRIPTING_CSV_UTTERANCE_STARTROW_HEADER]: 'SampleSentences'
          }
          const compiler = new Compiler(context, Object.assign({}, DefaultCapabilities, caps))

          try {
            compiler.Compile(scriptBuffer, 'SCRIPTING_TYPE_CONVO')
            assert.fail('expected error')
          } catch (err) {
            assert.equal(err.message, 'Failed to parse conversation. Section "DisplayName" unknown.')
          }
        })
      })
    })
    describe('In non-legacy mode', function () {
      describe('Utterance mode', function () {
        it('should read oldscool single column format', async function () {
          const scriptBuffer = fs.readFileSync(path.resolve(__dirname, CONVOS_DIR, 'utterances_singlecolumn.csv'))
          const context = buildContext()

          const caps = {
            [Capabilities.SCRIPTING_CSV_LEGACY_MODE_OFF]: true
          }

          const compiler = new Compiler(context, Object.assign({}, DefaultCapabilities, caps))

          compiler.Compile(scriptBuffer, 'SCRIPTING_TYPE_UTTERANCES')
          assert.lengthOf(context.utterances, 1)
          assert.deepEqual(context.utterances[0], {
            name: 'singlecolumn',
            utterances: ['hello', 'hi']
          })
        })
        it('BUG, 3 column utterance is not well supported', async function () {
          const scriptBuffer = fs.readFileSync(path.resolve(__dirname, CONVOS_DIR, 'utterances_multicolumn3col.csv'))
          const context = buildContext()

          const caps = {
            [Capabilities.SCRIPTING_CSV_LEGACY_MODE_OFF]: true
          }

          const compiler = new Compiler(context, Object.assign({}, DefaultCapabilities, caps))

          compiler.Compile(scriptBuffer, 'SCRIPTING_TYPE_UTTERANCES')
          assert.lengthOf(context.utterances, 0)
          assert.lengthOf(context.convos, 0)
        })
        it('should read multi column format 5 col', async function () {
          const scriptBuffer = fs.readFileSync(path.resolve(__dirname, CONVOS_DIR, 'utterances_multicolumn5col.csv'))
          const context = buildContext()

          const caps = {
            [Capabilities.SCRIPTING_CSV_LEGACY_MODE_OFF]: true
          }

          const compiler = new Compiler(context, Object.assign({}, DefaultCapabilities, caps))

          compiler.Compile(scriptBuffer, 'SCRIPTING_TYPE_UTTERANCES')
          assert.lengthOf(context.utterances, 5)
          assert.lengthOf(context.convos, 0)
          assert.deepEqual(context.utterances[0], {
            "name": "5col",
            "utterances": [
              "hello",
              "hi"
            ]
          })
        })
        // maybe we could read it
        it('should read liveperson format with SCRIPTING_CSV_STARTROW', async function () {
          const scriptBuffer = fs.readFileSync(path.resolve(__dirname, CONVOS_DIR, 'utterances_liveperson.csv'))
          const context = buildContext()

          const caps = {
            [Capabilities.SCRIPTING_CSV_UTTERANCE_STARTROW]: 12,
            [Capabilities.SCRIPTING_CSV_LEGACY_MODE_OFF]: true
          }
          const compiler = new Compiler(context, Object.assign({}, DefaultCapabilities, caps))

          compiler.Compile(scriptBuffer, 'SCRIPTING_TYPE_UTTERANCES')
          assert.lengthOf(context.utterances, 21)
          assert.lengthOf(context.convos, 0)
          assert.deepEqual(context.utterances[0], {
            "name": "ask about installation",
            "utterances": [
              "about my appointment",
              "book service installation appointment"
            ]
          })
        })
        it('should read liveperson format with SCRIPTING_CSV_STARTROWHEADER', async function () {
          const scriptBuffer = fs.readFileSync(path.resolve(__dirname, CONVOS_DIR, 'utterances_liveperson.csv'))
          const context = buildContext()

          const caps = {
            [Capabilities.SCRIPTING_CSV_UTTERANCE_STARTROW]: 12,
            [Capabilities.SCRIPTING_CSV_LEGACY_MODE_OFF]: true
          }

          const compiler = new Compiler(context, Object.assign({}, DefaultCapabilities, caps))

          compiler.Compile(scriptBuffer, 'SCRIPTING_TYPE_UTTERANCES')
          assert.lengthOf(context.utterances, 21)
          assert.lengthOf(context.convos, 0)
          assert.deepEqual(context.utterances[0], {
            "name": "ask about installation",
            "utterances": [
              "about my appointment",
              "book service installation appointment"
            ]
          })
        })
      })
      describe('Convo mode', function () {
        it('should not read oldscool single column format', async function () {
          const scriptBuffer = fs.readFileSync(path.resolve(__dirname, CONVOS_DIR, 'utterances_singlecolumn.csv'))
          const context = buildContext()

          const caps = {
            [Capabilities.SCRIPTING_CSV_LEGACY_MODE_OFF]: true
          }
          const compiler = new Compiler(context, Object.assign({}, DefaultCapabilities, caps))

          compiler.Compile(scriptBuffer, 'SCRIPTING_TYPE_CONVO')
          assert.lengthOf(context.utterances, 0)
        })
        it('BUG, 3 column utterance is not well supported', async function () {
          const scriptBuffer = fs.readFileSync(path.resolve(__dirname, CONVOS_DIR, 'utterances_multicolumn3col.csv'))
          const context = buildContext()

          const caps = {
            [Capabilities.SCRIPTING_CSV_LEGACY_MODE_OFF]: true
          }

          const compiler = new Compiler(context, Object.assign({}, DefaultCapabilities, caps))
          assert.lengthOf(context.utterances, 0)
          assert.lengthOf(context.convos, 0)

          try {
            compiler.Compile(scriptBuffer, 'SCRIPTING_TYPE_CONVO')
            assert.fail('expected error')
          } catch (err) {
            assert.equal(err.message, 'Failed to parse conversation. Section "goodbye" unknown.')
          }
        })
        it('should not parse multi column uttrances as convos', async function () {
          const scriptBuffer = fs.readFileSync(path.resolve(__dirname, CONVOS_DIR, 'utterances_multicolumn5col.csv'))
          const context = buildContext()

          const caps = {
            [Capabilities.SCRIPTING_CSV_LEGACY_MODE_OFF]: true
          }

          const compiler = new Compiler(context, Object.assign({}, DefaultCapabilities, caps))
          compiler.Compile(scriptBuffer, 'SCRIPTING_TYPE_CONVO')
          assert.lengthOf(context.utterances, 0)
          assert.lengthOf(context.convos, 0)
        })
        it('should NOT read liveperson format with SCRIPTING_CSV_UTTERANCE_STARTROW', async function () {
          const scriptBuffer = fs.readFileSync(path.resolve(__dirname, CONVOS_DIR, 'utterances_liveperson.csv'))
          const context = buildContext()

          const caps = {
            [Capabilities.SCRIPTING_CSV_UTTERANCE_STARTROW]: 12,
            [Capabilities.SCRIPTING_CSV_LEGACY_MODE_OFF]: true
          }
          const compiler = new Compiler(context, Object.assign({}, DefaultCapabilities, caps))

          compiler.Compile(scriptBuffer, 'SCRIPTING_TYPE_CONVO')
          assert.lengthOf(context.utterances, 0)
          assert.lengthOf(context.convos, 0)
        })
        it('should NOT read liveperson format with SCRIPTING_CSV_STARTROWHEADER', async function () {
          const scriptBuffer = fs.readFileSync(path.resolve(__dirname, CONVOS_DIR, 'utterances_liveperson.csv'))
          const context = buildContext()

          const caps = {
            [Capabilities.SCRIPTING_CSV_UTTERANCE_STARTROW_HEADER]: 'SampleSentences',
            [Capabilities.SCRIPTING_CSV_LEGACY_MODE_OFF]: true
          }
          const compiler = new Compiler(context, Object.assign({}, DefaultCapabilities, caps))

          compiler.Compile(scriptBuffer, 'SCRIPTING_TYPE_CONVO')
          assert.lengthOf(context.utterances, 0)
          assert.lengthOf(context.convos, 0)
        })
      })
    })
  })
})
