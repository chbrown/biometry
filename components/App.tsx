import * as React from 'react'
import * as moment from 'moment'
import {connect} from 'react-redux'

import {Configuration, GlobalState} from '../types'

import MetricsTable from './MetricsTable'
import RecentActions from './RecentActions'
import ConfigNumber from './ConfigNumber'
import ConfigCheckbox from './ConfigCheckbox'

const packageDefinition = require('../package.json')

// webpack replaces this symbol when building the full bundle
const buildTimestamp = process.env.WEBPACK_TIMESTAMP

interface AppProps {
  configuration: Configuration
  now: Date
}

const App = (props: AppProps) => {
  const {configuration, now} = props
  const {daysPast} = configuration
  const end = moment().endOf('day')
  const start = end.clone().subtract(daysPast, 'd')
  return (
    <main>
      <div className="flex">
        <h2>Biometry App</h2>
        <div>
          <ConfigNumber label="Days Past" name="daysPast" />
          <ConfigCheckbox label="Sort Alphabetically" name="sortAlphabetically" />
          <ConfigCheckbox label="Exclude Empty" name="excludeEmpty" />
        </div>
      </div>
      <section>
        <MetricsTable start={start} end={end} />
      </section>
      <section>
        <h3>Recent Additions</h3>
        <RecentActions limit={20} />
      </section>
      <footer>
        <div className="important">Now: {now.toISOString()}</div>
        <div>Built: {buildTimestamp}</div>
        <div>Version: {packageDefinition.version}</div>
      </footer>
    </main>
  )
}

const mapStateToProps = ({configuration, now}: GlobalState) => ({configuration, now})
const ConnectedApp = connect(mapStateToProps)(App)

export default ConnectedApp
