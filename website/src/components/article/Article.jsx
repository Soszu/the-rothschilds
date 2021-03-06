import React from 'react'
import cnames from 'classnames'
import { inject, observer } from 'mobx-react'
import { toJS } from 'mobx'
import { withStyles } from 'material-ui/styles'
import { withRouter } from 'react-router-dom'
import Paper from 'material-ui/Card';
import Button from 'material-ui/Button'
import Typography from 'material-ui/Typography'
import parseTemplate from 'string-template'

@withStyles((theme) => ({
root: {
  maxWidth: 800,
  marginBottom: 20,
  marginLeft: 'auto',
  marginRight: 'auto',
  padding: 25,
},
blockHeader: {
  marginTop: 10,
},
blockParagraph: {
  marginTop: 10,
},
blockPhoto: {
  height: 300,
  display: 'block',
  marginTop: 10,
  marginBottom: 20,
  marginLeft: 'auto',
  marginRight: 'auto',
},
explanation: {
  marginLeft: 15,
  marginRight: 15,
  marginTop: 2,
  borderRadius: 5,
  cursor: 'pointer',
  backgroundColor: '#ddd'
},
explanation__active: {
  backgroundColor: '#8bc34a',
  color: 'white',
  padding: 5,
},
explanationTitle: {
  textAlign: 'center',
  fontSize: '0.5rem',
  paddingTop: 2,
  opacity: .8,
},
explanationTitle__active: {
  opacity: 1,
  fontSize: '0.75rem',
},
explanationText: {
  textAlign: 'justify',
  padding: 5,
},
explanationText__active: {
  color: 'white',
},
}))
@inject('quizStore')
@observer
@withRouter
export default class Article extends React.Component {
  state = {
    activeExplanations: {},
  }
  shouldBlockRender = (conditions) => {
    if (!conditions) {
      return true
    } else {
      const { sex, answers } = this.props.quizStore
      if (!_.isUndefined(conditions.sex) && sex !== conditions.sex)
        return false
      let mismatch = false
      _.forEach(_.keys(conditions), (key) => {
        if (!_.isUndefined(answers[key]) && answers[key] !== conditions[key])
          mismatch = true
      })
      return !mismatch
    }
  }

  handleToggleExplanation = (id) => {
    const activeExplanations = _.assign({}, this.state.activeExplanations)
    if (this.state.activeExplanations[id])
      delete activeExplanations[id]
    else
      activeExplanations[id] = true
    this.setState({ activeExplanations: activeExplanations })
  }

  renderExplanation(explanationId) {
    const { classes } = this.props
    const explanation = _.find(this.props.quizStore.explanations, { id: explanationId })
    if (!explanation) {
      return null
    } else {
      const isActive = this.state.activeExplanations[explanation.id]
      const classNames = {}
      classNames[classes.explanation] = true
      classNames[classes.explanation__active] = isActive
      const classNamesTitle = {}
      classNamesTitle[classes.explanationTitle] = true
      classNamesTitle[classes.explanationTitle__active] = isActive
      const classNamesText = {}
      classNamesText[classes.explanationText] = true
      classNamesText[classes.explanationText__active] = isActive
      if (isActive) {
        return (
          <div className={cnames(classNames)} onClick={() => this.handleToggleExplanation(explanation.id)} >
            <Typography className={cnames(classNamesTitle)} variant="button" >
              {explanation.title}
            </Typography>
            {isActive && <Typography className={cnames(classNamesText)} variant="caption">{explanation.text}</Typography>}
          </div>
        )
      } else {
        return (
        <Button
          color="secondary"
          style={{ display: 'block', margin: 3 }}
          variant="raised"
          onClick={() => this.handleToggleExplanation(explanation.id)}
        >
          Kliknij i odkryj manipulację
        </Button>
        )
      }
    }
  }

  renderBlock(block) {
    const { classes } = this.props
    const sex = this.props.quizStore.sex
    const reg = /{[^\/]*\/[^}]*}/gi
    let txt = block.text || ''
    txt = parseTemplate(txt, {
      name: this.props.quizStore.name,
    })
    const matches = txt.match(reg)
    _.forEach(matches, (match) => {
      const middle = match.indexOf('/')
      const version = this.props.quizStore.sex === 'M'
        ? match.substring(1, middle)
        : match.substring(middle + 1, match.length - 1)
      txt = txt.replace(match, version)
    })
    switch (block.type) {
    case 'header':
      return <Typography className={classes.blockHeader} variant="display1" component="h2" >{txt}</Typography >
    case 'paragraph':
      return <Typography className={classes.blockParagraph} component="p" >{txt}</Typography>
    case 'photo':
      return <img className={classes.blockPhoto} src={block.url} alt="" />
    default:
      return null
    }
  }

  render() {
    const { blocks } = this.props.quizStore
    const { classes } = this.props
    return (
      <Paper className={classes.root}>
        {blocks.map((block, index) => {
          if (!this.shouldBlockRender(block.conditions)) {
            return null
          } else if (block.explanation) {
            return (
              <div key={index}>
                {this.renderBlock(block)}
                {_.isArray(toJS(block.explanation))
                  ? block.explanation.map(explanation => {
                    return this.renderExplanation(explanation)
                  }) : (
                    this.renderExplanation(block.explanation)
                  )
                }
              </div>
            )
          } else {
            return this.renderBlock(block)
          }
        })}
        <div style={{height: 30}}>
          <Button
            color="primary"
            style={{ float: 'right' }}
            variant="raised"
            onClick={() => { this.props.history.push('/quest') }}
            className={cnames(classes.buttonRight, classes.button)}
          >
            Sprawdź swoją wiedzę w praktyce
          </Button>
        </div>
      </Paper>
    )
  }
}
