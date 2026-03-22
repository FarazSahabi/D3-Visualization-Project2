d3.select('#datavis_header')
.style('color', 'black')
.text('Sleep Analysis for WHOOP');

const margin = {top: 100, bottom: 50, left: 60, right: 150};
const width = 800 - margin.left - margin.right;
const height = 700 - margin.top - margin.bottom;

const svg = d3.select('#chart')
.attr('width', width + margin.left + margin.right)
.attr('height', height + margin.top + margin.bottom)
.append('g')
.attr('transform', `translate(${margin.left}, ${margin.top})`);

d3.csv('./src/whoop_fitness_dataset_100k.csv').then(data => {

  const start = new Date('2023-01-16');
  const end = new Date('2023-01-22');

  data = data.filter(d =>
    d.user_id === 'USER_00001' &&
    new Date(d.date) >= start &&
    new Date(d.date) <= end
  );

  data.forEach(d => {
    d.sleep_efficiency = +d.sleep_efficiency;
    d.light_sleep_hours = +d.light_sleep_hours;
    d.rem_sleep_hours = +d.rem_sleep_hours;
    d.deep_sleep_hours = +d.deep_sleep_hours;
    d.workout_completed = +d.workout_completed;
    d.dateObj = new Date(d.date);
    d.day = d3.timeFormat('%A')(d.dateObj);
  });

  data.sort((a,b) => a.dateObj - b.dateObj);

  // HEADER INFO
  svg.append('text')
    .attr('x', 0)
    .attr('y', -60)
    .text('User: USER_00001');

  svg.append('text')
    .attr('x', 0)
    .attr('y', -40)
    .text('Date: 2023-01-22');

  // =========================
  // 🔵 CHART 1: SCATTER
  // =========================

  const chart1Height = height / 2 - 40;

  // TITLE
  svg.append('text')
    .attr('x', 0)
    .attr('y', -10)
    .style('font-weight', 'bold')
    .text('Sleep Efficiency % Trend (Last 7 Days)');

  const x1 = d3.scaleBand()
    .domain(data.map(d => d.day))
    .range([0, width])
    .padding(0.5);

  const y1 = d3.scaleLinear()
    .domain([50, 100])
    .range([chart1Height, 0]);

  svg.append('g')
    .attr('transform', `translate(0, ${chart1Height})`)
    .call(d3.axisBottom(x1));

  svg.append('g')
    .call(d3.axisLeft(y1).ticks(5));

  svg.selectAll('.dot')
    .data(data)
    .enter()
    .append('circle')
    .attr('cx', d => x1(d.day) + x1.bandwidth()/2)
    .attr('cy', d => y1(d.sleep_efficiency))
    .attr('r', 6)
    .attr('fill', d => d.workout_completed ? 'green' : 'red');

  // LEGEND 1 (scatter)
  const legend1 = svg.append('g')
    .attr('transform', `translate(${width + 20}, 20)`);

  legend1.append('circle')
    .attr('cx', 0).attr('cy', 0)
    .attr('r', 6)
    .attr('fill', 'green');

  legend1.append('text')
    .attr('x', 10).attr('y', 5)
    .text('Workout Day');

  legend1.append('circle')
    .attr('cx', 0).attr('cy', 25)
    .attr('r', 6)
    .attr('fill', 'red');

  legend1.append('text')
    .attr('x', 10).attr('y', 30)
    .text('Rest Day');

  // =========================
  // 🔴 CHART 2: STACKED BAR
  // =========================

  const chart2Y = chart1Height + 80;
  const chart2Height = height / 2 - 60;

  // TITLE
  svg.append('text')
    .attr('x', 0)
    .attr('y', chart2Y - 20)
    .style('font-weight', 'bold')
    .text('Sleep Composition (Hours per Day)');

  const x2 = d3.scaleBand()
    .domain(data.map(d => d.day))
    .range([0, width])
    .padding(0.2);

  const y2 = d3.scaleLinear()
    .domain([0, 8])
    .range([chart2Height, 0]);

  const g2 = svg.append('g')
    .attr('transform', `translate(0, ${chart2Y})`);

  g2.append('g')
    .attr('transform', `translate(0, ${chart2Height})`)
    .call(d3.axisBottom(x2));

  g2.append('g')
    .call(d3.axisLeft(y2).ticks(8));

  const stack = d3.stack()
    .keys(['light_sleep_hours', 'rem_sleep_hours', 'deep_sleep_hours']);

  const stackedData = stack(data);

  const colors = {
    light_sleep_hours: '#333',
    rem_sleep_hours: '#999',
    deep_sleep_hours: '#fff'
  };

  g2.selectAll('g.layer')
    .data(stackedData)
    .enter()
    .append('g')
    .attr('fill', d => colors[d.key])
    .selectAll('rect')
    .data(d => d)
    .enter()
    .append('rect')
    .attr('x', (d, i) => x2(data[i].day))
    .attr('y', d => y2(d[1]))
    .attr('height', d => y2(d[0]) - y2(d[1]))
    .attr('width', x2.bandwidth())
    .attr('stroke', (d,i) => data[i].workout_completed ? 'green' : 'red')
    .attr('stroke-width', 2);

  // LEGEND 2 (stacked bar)
  const legend2 = svg.append('g')
    .attr('transform', `translate(${width + 20}, ${chart2Y})`);

  // workout borders
  legend2.append('rect')
    .attr('width', 12).attr('height', 12)
    .attr('fill', 'none')
    .attr('stroke', 'green')
    .attr('stroke-width', 2);

  legend2.append('text')
    .attr('x', 18).attr('y', 10)
    .text('Workout Day');

  legend2.append('rect')
    .attr('y', 20)
    .attr('width', 12).attr('height', 12)
    .attr('fill', 'none')
    .attr('stroke', 'red')
    .attr('stroke-width', 2);

  legend2.append('text')
    .attr('x', 18).attr('y', 30)
    .text('Rest Day');

  // sleep shades
  legend2.append('rect')
    .attr('y', 50)
    .attr('width', 12).attr('height', 12)
    .attr('fill', '#333');

  legend2.append('text')
    .attr('x', 18).attr('y', 60)
    .text('Light Sleep');

  legend2.append('rect')
    .attr('y', 70)
    .attr('width', 12).attr('height', 12)
    .attr('fill', '#999');

  legend2.append('text')
    .attr('x', 18).attr('y', 80)
    .text('REM Sleep');

  legend2.append('rect')
    .attr('y', 90)
    .attr('width', 12).attr('height', 12)
    .attr('fill', '#fff')
    .attr('stroke', 'black');

  legend2.append('text')
    .attr('x', 18).attr('y', 100)
    .text('Deep Sleep');
});
