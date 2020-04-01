import React, { useEffect, useState } from 'react';
import { Layout, Menu } from 'antd';
// @ts-ignore
import { history } from 'umi';
import { IMenu } from '@/types/global';
import { menus } from '@/utils/menus';

const BasicLayout: React.FC = props => {
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [openKeys, setOpenKeys] = useState<string[]>([]);

  function createMenu(menu: IMenu) {
    if (menu.children) {
      return (
        <Menu.SubMenu key={menu.path} title={menu.title}>
          {menu.children?.map(item => createMenu(item))}
        </Menu.SubMenu>
      );
    }
    return (
      <Menu.Item
        key={menu.path}
        onClick={({ key, keyPath }) => {
          setSelectedKeys(keyPath);
          history.push(key);
        }}
      >
        {menu.title}
      </Menu.Item>
    );
  }

  useEffect(() => {
    // @ts-ignore
    const pathname = props.location?.pathname;
    const pathnameSplit = pathname.split('/');
    if (pathnameSplit.length === 3) {
      setOpenKeys(['/' + pathnameSplit[1]]);
    }
    setSelectedKeys([pathname]);
  }, []);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Layout.Sider>
        {/* eslint-disable-next-line jsx-a11y/heading-has-content */}
        <h1 style={{ color: '#fff', textAlign: 'center', padding: 10 }}>
          WebGL编程指南示例
        </h1>
        <Menu
          theme={'dark'}
          mode={'inline'}
          selectedKeys={selectedKeys}
          openKeys={openKeys}
          onOpenChange={openKeys => setOpenKeys(openKeys)}
        >
          {menus.map(item => createMenu(item))}
        </Menu>
      </Layout.Sider>
      <Layout.Content>
        <div style={{ padding: 20, width: '100%', height: '100%' }}>
          {props.children}
        </div>
      </Layout.Content>
    </Layout>
  );
};

export default BasicLayout;
