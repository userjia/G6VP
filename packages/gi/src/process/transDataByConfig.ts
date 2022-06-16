import { GraphinData, IUserEdge } from '@antv/graphin';
import { GIAssets, GIConfig } from '../typing';
import { uniqueElementsBy } from './common';
import { filterByRules } from './filterByRules';
import processEdges from './processEdges';

/**
 *
 * @param elementType 元素类型：node or edge
 * @param data 数据
 * @param config GISDK配置
 * @param ElementAssets 元素资产
 * @param reset 是否重置transform
 * @returns nodes or edges
 */
export const transDataByConfig = (
  elementType: 'nodes' | 'edges',
  data: GraphinData,
  config: GIConfig,
  ElementAssets: GIAssets['elements'],
  reset?: boolean,
) => {
  console.time(`${elementType.toUpperCase()}_TRANS_COST`);

  const elementConfig = config[elementType];

  const defaultConfig =
    elementType === 'nodes'
      ? {
          id: 'SimpleNode',
          props: {},
          name: '官方节点',
          order: -1,
          expressions: [],
          logic: false,
          groupName: `GLOBAL TYPE`,
        }
      : {
          id: 'SimpleEdge',
          props: {},
          name: '官方边',
          order: -1,
          expressions: [],
          logic: false,
          groupName: `GLOBAL TYPE`,
        };

  if (!elementConfig) {
    return {};
  }

  let elementData = data[elementType];

  if (elementType === 'edges') {
    // 先整体做个多边处理
    elementData = processEdges(elementData as IUserEdge[], {
      poly: 30,
      loop: 10,
    });
  }

  const [basicConfig, ...otherConfigs] = elementConfig;

  const filterElements = otherConfigs
    .map(item => {
      //@ts-ignore
      const { id, expressions, logic } = item;
      const Element = ElementAssets[id];
      const filterData = filterByRules(elementData, { logic, expressions });
      return Element.registerTransform(filterData, item, reset);
    })
    .reduce((acc, curr) => {
      return [...curr, ...acc];
    }, []);

  const uniqueElements = uniqueElementsBy(filterElements, (a, b) => {
    return a.id === b.id;
  });
  const uniqueIds = uniqueElements.map(n => n.id);
  //@ts-ignore
  const restElements = elementData.filter(n => {
    return uniqueIds.indexOf(n.id) === -1;
  });

  //@ts-ignore
  const restData = ElementAssets[basicConfig.id].registerTransform(restElements, basicConfig, reset);

  const nodes = [...uniqueElements, ...restData];
  console.timeEnd(`${elementType.toUpperCase()}_TRANS_COST`);

  return nodes;
};
