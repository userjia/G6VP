/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import { createFromIconfontCN, DeploymentUnitOutlined, ExportOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, Drawer, notification, Tooltip } from 'antd';
import * as React from 'react';
import { useHistory } from 'react-router-dom';
import { useImmer } from 'use-immer';
import { useContext } from '../../pages/Analysis/hooks/useContext';
import { addProject, getProjectById, updateProjectById } from '../../services';
import ODPSDeploy from '../ODPSDeploy';
import ProjectTitle from '../ProjectTitle';
import Tour from '../Tour';
import BaseNavbar from './BaseNavbar';
import ExportConfig from './ExportConfig';
import './index.less';
import type { INavbarState } from './typing';

interface SvgIconProps {
  type: string; // 必传
  [field: string]: any; // 与antd的icon一致
}
const SvgIcon: React.FC<SvgIconProps> = props => {
  const Icon = createFromIconfontCN({
    scriptUrl: '//at.alicdn.com/t/font_241110_bw0oh2dqbb8.js',
  });
  return <Icon {...props} />;
};

interface NavbarProps {
  projectId: string;
  enableAI: boolean;
  graphRef: React.RefObject<any>;
}
/**
 * 顶部导航
 * @see {NavbarProps}
 * @returns
 */

const Navbar = ({ projectId, enableAI, graphRef }: NavbarProps) => {
  const history = useHistory();
  const [state, updateState] = useImmer<INavbarState>({
    initProject: {},
    exportVisible: false,
    deployVisible: false,
  });

  const { context, updateContext } = useContext();
  const { config, serviceConfig, activeAssetsKeys } = context;

  const handleOutClose = () => {
    updateState(draft => {
      draft.exportVisible = false;
    });
  };

  const handleOutOpen = () => {
    updateState(draft => {
      draft.exportVisible = true;
    });
  };

  const handleDeployOpen = () => {
    updateState(draft => {
      draft.deployVisible = true;
    });
  };

  const hanldeDeployClose = () => {
    updateState(draft => {
      draft.deployVisible = false;
    });
  };

  const handleSave = async () => {
    const origin = await getProjectById(projectId);

    // @ts-igono
    if (origin.type === 'case') {
      const projectId = await addProject({
        name: origin?.name,
        type: 'project',
        data: JSON.stringify(origin?.data),
        schemaData: JSON.stringify(origin?.schemaData),
        serviceConfig: JSON.stringify(serviceConfig),
        activeAssetsKeys: JSON.stringify(activeAssetsKeys),
        projectConfig: JSON.stringify(config),
      });
      history.push(`/workspace/${projectId}?nav=data`);
    } else {
      const data = graphRef.current && graphRef.current.save();

      updateProjectById(projectId, {
        data: JSON.stringify({
          ...(origin && origin.data),
          transData: data,
        }),
        serviceConfig: JSON.stringify(serviceConfig),
        activeAssetsKeys: JSON.stringify(activeAssetsKeys),
        projectConfig: JSON.stringify(config),
      });
      const SERVER_ENGINE_CONTEXT_STRING = localStorage.getItem('SERVER_ENGINE_CONTEXT') || '{}';
      const SERVER_ENGINE_CONTEXT = JSON.parse(SERVER_ENGINE_CONTEXT_STRING);

      localStorage.setItem(
        'SERVER_ENGINE_CONTEXT',
        JSON.stringify({
          ...SERVER_ENGINE_CONTEXT,
          data: data,
        }),
      );
    }
    updateContext(draft => {
      draft.isSave = true;
    });
    notification.success({
      message: '保存成功',
    });
  };

  // 点击智能推荐 Icon
  const handleAiIconClick = () => {
    updateContext(draft => {
      draft.enableAI = !enableAI;
    });
  };
  const handleDownloadProject = async () => {
    const project = await getProjectById(projectId);
    const { config, name, ...others } = project;
    const params = {
      ...others,
      name,
      projectConfig: config,
    };

    const elementA = document.createElement('a');
    elementA.download = name;
    elementA.style.display = 'none';
    const blob = new Blob([JSON.stringify(params, null, 2)]);
    elementA.href = URL.createObjectURL(blob);
    document.body.appendChild(elementA);
    elementA.click();
    document.body.removeChild(elementA);
  };

  React.useEffect(() => {
    (async () => {
      const project = await getProjectById(projectId);
      updateState(draft => {
        draft.initProject = project;
      });
    })();
  }, []);
  //@ts-ignore
  const { name } = state.initProject;
  const rightContent = (
    <>
      <Tooltip title="保存">
        <Button icon={<SaveOutlined />} onClick={handleSave} size="small" className="gi-intro-save">
          保存
        </Button>
      </Tooltip>
      <Tooltip title="下载项目">
        <Button icon={<SaveOutlined />} onClick={handleDownloadProject} size="small" className="gi-intro-save">
          下载项目
        </Button>
      </Tooltip>
      <Tooltip title="导出 SDK">
        <Button icon={<ExportOutlined />} onClick={handleOutOpen} size="small" className="gi-intro-export">
          导出 SDK
        </Button>
      </Tooltip>
      {/* <Tooltip title="自动推荐样式">
        <Button onClick={handleAiIconClick} size="small">
          <SvgIcon type="icon-magic1" style={{ color: enableAI ? '#3471f9' : '' }} />
        </Button>
      </Tooltip> */}
      <Tooltip title="部署项目">
        <Button icon={<DeploymentUnitOutlined />} onClick={handleDeployOpen} size="small">
          部署
        </Button>
      </Tooltip>
      <Tooltip title="指引手册">
        <Tour />
      </Tooltip>
    </>
  );
  return (
    <BaseNavbar rightContent={rightContent} leftContent={<></>}>
      <ProjectTitle name={name} projectId={projectId} />
      <Drawer
        title="导出配置"
        placement="right"
        closable={false}
        onClose={handleOutClose}
        visible={state.exportVisible}
        width="calc(100vw - 382px)"
      >
        {state.exportVisible && <ExportConfig></ExportConfig>}
      </Drawer>
      <Drawer
        title="部署"
        placement="right"
        closable={false}
        visible={state.deployVisible}
        onClose={hanldeDeployClose}
        width="25vw"
      >
        <ODPSDeploy />
      </Drawer>
    </BaseNavbar>
  );
};

export default Navbar;
