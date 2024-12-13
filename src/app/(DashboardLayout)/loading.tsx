"use client";
import React from 'react';
import { Spin, Typography, Space } from 'antd';

const Loading = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        textAlign: 'center',
      }}
    >
      <Space direction="vertical" size="large">
        <Spin size="large" tip="Loading..." />
      </Space>
    </div>
  );
};

export default Loading;
