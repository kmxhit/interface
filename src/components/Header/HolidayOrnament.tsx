import { ReactElement } from 'react'
import styled from 'styled-components/macro'

import SantaHat from '../../assets/images/santa-hat.png'

const SantaHatImage = styled.img`
  position: absolute;
  top: -4px;
  right: -4px;
  height: 18px;
`

const DATE_TO_ORNAMENT: { [date: string]: ReactElement } = {
  '12-25': <SantaHatImage src={SantaHat} alt="Santa hat" />,
}

const HolidayOrnament = () => {
  // months in javascript are 0 indexed...
  const today = `${new Date().getMonth() + 1}-${new Date().getDate()}`
  return DATE_TO_ORNAMENT[today] || null
}

export default HolidayOrnament
