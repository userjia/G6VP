// 组件市场
import { AppstoreOutlined, FireFilled, PlusOutlined, DatabaseOutlined } from '@ant-design/icons';
import { Card, Col, Radio, Tabs, Button, Row } from 'antd';
import React from 'react';
import { Link } from 'react-router-dom';
import { Provider } from 'react-redux';
import { useImmer } from 'use-immer';
import BaseNavbar from '../../components/Navbar/BaseNavbar';
import { queryAssets } from '../../services/assets.market';
import { queryAssetList } from '../../services/assets';
import CreateAsset from './Create';
import { getComponentsByAssets, getElementsByAssets } from '../Analysis/getAssets';
import store from '../Analysis/redux';
import styles from './index.less';

const { TabPane } = Tabs;

const ComponentMarket = props => {
  const { history } = props;

  const [state, setState] = useImmer({
    components: [],
    elements: [],
    services: [],
    visible: false,
    type: 'services',
  });

  const getAssertList = async () => {
    const result = await queryAssetList();

    const { data, success } = result;
    if (success) {
      const componentList = data.filter(d => d.type === 1);
      const serviceList = data.filter(d => d.type === 3);
      const elementList = data.filter(d => d.type === 4 || d.type === 5);
      setState(draft => {
        draft.components = componentList;
        draft.services = serviceList;
        draft.elements = elementList;
      });
    }
  };

  React.useEffect(() => {
    // 通过调用服务端接口，获取资产列表
    getAssertList();
  }, []);

  const { components, elements, services, type } = state;

  const handleShowCreateModel = () => {
    setState(draft => {
      draft.visible = true;
    });
  };

  const handleClose = () => {
    setState(draft => {
      draft.visible = false;
    });
  };

  const handleChangeType = evt => {
    setState(draft => {
      draft.type = evt.target.value;
    });
  };

  const fliterGroup = (
    <div className={styles.control}>
      <Radio.Group defaultValue="asserts" size="middle" className="fliter">
        <Radio.Button value="asserts" style={{ marginRight: 10, border: 'none' }}>
          全部资产
        </Radio.Button>
        <Radio.Button value="elements" style={{ marginRight: 10, border: 'none' }}>
          我收藏的
        </Radio.Button>
      </Radio.Group>
      <div style={{ position: 'relative', top: 10, left: 12 }}>
        <Radio.Group defaultValue="services" size="small" className={styles.assetType} onChange={handleChangeType}>
          <Radio.Button value="services" style={{ marginRight: 10, borderRadius: 17 }}>
            服务
          </Radio.Button>
          <Radio.Button value="components" style={{ marginRight: 10, borderRadius: 17 }}>
            组件
          </Radio.Button>
          <Radio.Button value="elements" style={{ marginRight: 10, borderRadius: 17 }}>
            元素
          </Radio.Button>
          <Radio.Button value="layout" style={{ marginRight: 10, borderRadius: 17 }}>
            布局
          </Radio.Button>
        </Radio.Group>
      </div>
    </div>
  );

  debugger;
  let listData = [];
  if (type === 'components') {
    listData = components;
  } else if (type === 'services') {
    listData = services;
  } else if (type === 'elements') {
    listData = elements;
  }
  return (
    <>
      <BaseNavbar active="market"></BaseNavbar>
      <div className={styles.container}>
        <div className={styles.title}>图可视分析资产市场</div>
        <div className={styles.buttongroup}>
          <Button type="primary" shape="round" onClick={() => handleShowCreateModel()}>
            创建资产
          </Button>
          <Button shape="round" ghost onClick={() => history.push('/market/personal')}>
            我的资产
          </Button>
        </div>
      </div>
      <div className={styles.background}>官方知识图谱样板间资产上线！</div>
      <div className="lists">
        {fliterGroup}
        <Row
          gutter={[{ xs: 8, sm: 16, md: 16, lg: 16 }, { xs: 8, sm: 16, md: 16, lg: 16 }]}
          style={{ marginLeft: 120, marginTop: 15 }}
        >
          {listData.map(c => {
            const { id, version, name, ownerNickname, displayName, gmtModified, branchName, type } = c;
            return (
              <Col key={id} style={{ width: '300px' }}>
                <Link
                  to={`/market/asserts/${id}?assetId=${id}&project=${name}&branch=${branchName}&type=${type}`}
                  style={{ color: '#424447' }}
                >
                  <Card hoverable>
                    <div className={styles.card}>
                      <div className={styles.icon}>
                        <AppstoreOutlined />
                      </div>
                      <div className={styles.desc}>
                        <h4>{displayName || name}</h4>
                        <div>作者：{ownerNickname}</div>
                        <div>版本：{version}</div>
                        <div>更新：{gmtModified}</div>
                      </div>
                      <div className={styles.fire}>
                        {'12'}
                        <FireFilled />
                      </div>
                    </div>
                  </Card>
                </Link>
              </Col>
            );
          })}
        </Row>
      </div>
      <CreateAsset visible={state.visible} close={handleClose} history={history} />
    </>
  );
};

const WrapAssetsMarket = props => {
  return (
    <Provider store={store}>
      <ComponentMarket {...props} />
    </Provider>
  );
};

export default WrapAssetsMarket;
