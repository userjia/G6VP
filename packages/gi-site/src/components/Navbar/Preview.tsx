import { Button, notification } from 'antd';
import * as React from 'react';

import { DesktopOutlined } from '@ant-design/icons';
import $i18n from '../../i18n';
import getExportContext from './getExportContext';
interface PreviewProps {
  context: any;
}

const Preview: React.FunctionComponent<PreviewProps> = props => {
  const { context } = props;

  const handleClick = async () => {
    const params = getExportContext(context);
    const { workbook } = params;
    const elementA = document.createElement('a');
    elementA.download = workbook.name as string;
    elementA.style.display = 'none';
    try {
      const blob = new Blob([JSON.stringify(params, null, 2)]);
      elementA.href = URL.createObjectURL(blob);
      document.body.appendChild(elementA);
      elementA.click();
      document.body.removeChild(elementA);
      notification.success({
        message: $i18n.get({
          id: 'gi-site.components.Navbar.Share.TheBackupProjectIsSuccessful',
          dm: '备份项目成功！',
        }),
        description: $i18n.get({
          id: 'gi-site.components.Navbar.Share.TheCurrentEnvironmentIsLocal',
          dm: '当前环境为「本地存储」，所有的操作数据均在您的浏览器本地 IndexedDB 中，因此您可下载项目文件进行分享，然后在「新建画布/恢复工作簿」中进行文件恢复',
        }),
      });
    } catch (error) {
      console.log(error);
      notification.error({
        message: $i18n.get({ id: 'gi-site.components.Navbar.Share.FailedToBackUpThe', dm: '备份项目失败！' }),
        description: $i18n.get(
          {
            id: 'gi-site.components.Navbar.Share.FailureReasonError',
            dm: '失败原因：{error}',
          },
          { error: error },
        ),
      });
    }
  };

  return (
    <div>
      <Button size="small" onClick={handleClick} icon={<DesktopOutlined />} type="text">
        预览
      </Button>
    </div>
  );
};

export default Preview;
