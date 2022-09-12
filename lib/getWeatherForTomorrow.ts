import axios from "axios";
const leftPad = require("left-pad");

const getWeatherForTomorrow = async () => {
  const response = await axios.get(
    "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/Helsinki?unitGroup=metric&key=WEWFFX8HBJ7ANFZ3TMDYCRN5E&contentType=json"
  );

  const hour_by_hour = response.data.days[1].hours;

  const temp_at_07 = hour_by_hour[7].temp;
  const temp_at_08 = hour_by_hour[8].temp;
  const temp_at_09 = hour_by_hour[9].temp;

  const precip07 = hour_by_hour[7].precip;
  const precip08 = hour_by_hour[8].precip;
  const precip09 = hour_by_hour[9].precip;

  const precip = precip07 + precip08 + precip09;

  const precipProb =
    hour_by_hour[7].precipprob +
    hour_by_hour[8].precipprob +
    hour_by_hour[9].precipprob;

  return `

Huomisen sää\n${response.data.days[1].conditions}
🌧 ${response.data.days[1].precip} mm ${response.data.days[1].precipprob}%  
🌡 ${response.data.days[1].tempmin} - ${response.data.days[1].tempmax} °C

Aamun uintisää:
<code>
Klo     07     08     09

°C    ${leftPad(temp_at_07, 4)}   ${leftPad(temp_at_08, 4)}   ${leftPad(
    temp_at_09,
    4
  )}
Sade
mm${leftPad(precip07, 8)}   ${leftPad(precip08, 4)}   ${leftPad(precip09, 4)}
% ${leftPad(hour_by_hour[7].precipprob, 8)}   ${leftPad(
    hour_by_hour[8].precipprob,
    4
  )}   ${leftPad(hour_by_hour[9].precipprob, 4)}
</code>

`;
};

export default getWeatherForTomorrow;
