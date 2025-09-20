import Svg, { Rect } from 'react-native-svg';
const BarChartSolid = ({ data, barWidth = 15, gap = 5, height = 90, color = '#0C439E' }) => {
  const maxValue = Math.max(...data); 
  const heightScale = height / maxValue;

  return (
    <Svg height={height} width={data.length * (barWidth + gap)}>
      {data.map((value, index) => (
        <Rect
          key={index}
          x={index * (barWidth + gap)}
          y={height - value * heightScale} 
          width={barWidth}
          height={value * heightScale}
          fill={color} 
        />
      ))}
    </Svg>
  );
};
export default BarChartSolid;