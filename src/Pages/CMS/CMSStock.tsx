import React, { useState, useEffect } from 'react';
import { CMSLayout } from './CMSLayout';
import { Table, Button, Badge, Form, Alert, Spinner, Modal, Card, Row, Col, InputGroup, Nav, Tab } from 'react-bootstrap';
import { FaExclamationTriangle, FaCheckCircle, FaTimes, FaBox, FaChartLine, FaFileExport, FaChartBar, FaDollarSign, FaList } from 'react-icons/fa';
import { getApiUrl } from '../../Utils/apiConfig';
import './cms-modals.scss';
import './cms-stock.scss';

interface StockAlert {
  id: number;
  productId: number;
  productName: string;
  alertType: 'low_stock' | 'out_of_stock' | 'backorder';
  stockQuantity: number;
  isResolved: boolean;
  createdAt: string;
  resolvedAt?: string;
  resolvedByName?: string;
  notes?: string;
}

interface Product {
  id: number;
  name: string;
  stockQuantity: number;
  stockEnabled: boolean;
  lowStockThreshold: number;
  allowBackorders: boolean;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock' | 'on_backorder';
}

interface StockStats {
  totalProductsWithStock: number;
  lowStockCount: number;
  outOfStockCount: number;
  onBackorderCount: number;
  totalAlerts: number;
}

interface StockMovement {
  id: number;
  productId: number;
  productName: string;
  movementType: string;
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  referenceType: string;
  referenceId: string;
  notes: string;
  createdByName: string;
  createdAt: string;
}

interface LowStockProduct {
  id: number;
  name: string;
  stockQuantity: number;
  lowStockThreshold: number;
  stockStatus: string;
  price: number;
  recommendedOrder: number;
  currentValue: number;
}

interface StockValueProduct {
  id: number;
  name: string;
  stockQuantity: number;
  price: number;
  stockStatus: string;
  totalValue: number;
}

export const CMSStock: React.FC = () => {
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [stats, setStats] = useState<StockStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [alertTypeFilter, setAlertTypeFilter] = useState<string>('');
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<StockAlert | null>(null);
  const [resolveNotes, setResolveNotes] = useState('');
  const [resolving, setResolving] = useState(false);
  const [showBulkAdjustModal, setShowBulkAdjustModal] = useState(false);
  const [bulkAdjustData, setBulkAdjustData] = useState({
    productId: '',
    quantity: 0,
    movementType: 'adjustment' as 'adjustment' | 'purchase' | 'return' | 'damaged',
    notes: ''
  });
  const [adjusting, setAdjusting] = useState(false);
  
  // Reports state
  const [activeTab, setActiveTab] = useState('alerts');
  const [reportLoading, setReportLoading] = useState(false);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [movementTotals, setMovementTotals] = useState<any>({});
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);
  const [stockValueProducts, setStockValueProducts] = useState<StockValueProduct[]>([]);
  const [totalInventoryValue, setTotalInventoryValue] = useState(0);
  const [statusBreakdown, setStatusBreakdown] = useState<any>({});
  const [summaryData, setSummaryData] = useState<any>(null);
  
  // Report filters
  const [reportFilters, setReportFilters] = useState({
    startDate: '',
    endDate: '',
    movementType: '',
    limit: 100
  });

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [alertTypeFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('cms_token');
      const apiUrl = getApiUrl();

      // Fetch alerts
      const alertsUrl = alertTypeFilter
        ? `${apiUrl}/stock.php/alerts?type=${alertTypeFilter}`
        : `${apiUrl}/stock.php/alerts`;
      
      const alertsRes = await fetch(alertsUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      // Fetch stats
      const [lowStockRes, outOfStockRes, backorderRes, allProductsRes] = await Promise.all([
        fetch(`${apiUrl}/stock.php?status=low_stock`),
        fetch(`${apiUrl}/stock.php?status=out_of_stock`),
        fetch(`${apiUrl}/stock.php?status=on_backorder`),
        fetch(`${apiUrl}/products.php?stockEnabled=true`),
      ]);

      const alertsData = await alertsRes.json();
      const [lowStockData, outOfStockData, backorderData, allProductsData] = await Promise.all([
        lowStockRes.json(),
        outOfStockRes.json(),
        backorderRes.json(),
        allProductsRes.json(),
      ]);

      if (alertsData.success) {
        setAlerts(alertsData.data || []);
      }

      const totalProducts = allProductsData.count || 0;
      const lowStockCount = lowStockData.count || 0;
      const outOfStockCount = outOfStockData.count || 0;
      const onBackorderCount = backorderData.count || 0;

      setStats({
        totalProductsWithStock: totalProducts,
        lowStockCount,
        outOfStockCount,
        onBackorderCount,
        totalAlerts: alertsData.data?.length || 0,
      });

      setError('');
    } catch (err) {
      setError('Failed to load stock data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveAlert = async () => {
    if (!selectedAlert) return;

    setResolving(true);
    try {
      const token = localStorage.getItem('cms_token');
      const apiUrl = getApiUrl();

      const response = await fetch(`${apiUrl}/stock.php/alerts/${selectedAlert.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ notes: resolveNotes }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setShowResolveModal(false);
        setSelectedAlert(null);
        setResolveNotes('');
        fetchData();
      } else {
        alert('Failed to resolve alert');
      }
    } catch (err) {
      alert('Failed to resolve alert');
      console.error(err);
    } finally {
      setResolving(false);
    }
  };

  const handleBulkAdjust = async () => {
    if (!bulkAdjustData.productId || bulkAdjustData.quantity === 0) {
      alert('Please select a product and enter a quantity');
      return;
    }

    setAdjusting(true);
    try {
      const token = localStorage.getItem('cms_token');
      const apiUrl = getApiUrl();

      const response = await fetch(`${apiUrl}/stock.php/adjust`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: parseInt(bulkAdjustData.productId),
          quantity: bulkAdjustData.quantity,
          movementType: bulkAdjustData.movementType,
          notes: bulkAdjustData.notes,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setShowBulkAdjustModal(false);
        setBulkAdjustData({
          productId: '',
          quantity: 0,
          movementType: 'adjustment',
          notes: ''
        });
        fetchData();
        alert('Stock adjusted successfully');
      } else {
        alert(data.message || 'Failed to adjust stock');
      }
    } catch (err) {
      alert('Failed to adjust stock');
      console.error(err);
    } finally {
      setAdjusting(false);
    }
  };

  const getAlertBadgeVariant = (alertType: string) => {
    switch (alertType) {
      case 'low_stock':
        return 'warning';
      case 'out_of_stock':
        return 'danger';
      case 'backorder':
        return 'info';
      default:
        return 'secondary';
    }
  };

  const getAlertTypeLabel = (alertType: string) => {
    switch (alertType) {
      case 'low_stock':
        return 'Low Stock';
      case 'out_of_stock':
        return 'Out of Stock';
      case 'backorder':
        return 'On Backorder';
      default:
        return alertType;
    }
  };

  const fetchMovementReport = async () => {
    setReportLoading(true);
    try {
      const token = localStorage.getItem('cms_token');
      const apiUrl = getApiUrl();
      const params = new URLSearchParams({
        type: 'movements',
        limit: reportFilters.limit.toString()
      });
      
      if (reportFilters.startDate) params.append('startDate', reportFilters.startDate);
      if (reportFilters.endDate) params.append('endDate', reportFilters.endDate);
      if (reportFilters.movementType) params.append('movementType', reportFilters.movementType);
      
      const response = await fetch(`${apiUrl}/stock.php/reports?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMovements(data.data || []);
        setMovementTotals(data.totals || {});
      }
    } catch (err) {
      console.error('Failed to load movement report:', err);
    } finally {
      setReportLoading(false);
    }
  };

  const fetchLowStockReport = async () => {
    setReportLoading(true);
    try {
      const token = localStorage.getItem('cms_token');
      const apiUrl = getApiUrl();
      
      const response = await fetch(`${apiUrl}/stock.php/reports?type=low_stock`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const data = await response.json();
      
      if (data.success) {
        setLowStockProducts(data.data || []);
      }
    } catch (err) {
      console.error('Failed to load low stock report:', err);
    } finally {
      setReportLoading(false);
    }
  };

  const fetchStockValueReport = async () => {
    setReportLoading(true);
    try {
      const token = localStorage.getItem('cms_token');
      const apiUrl = getApiUrl();
      
      const response = await fetch(`${apiUrl}/stock.php/reports?type=value`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const data = await response.json();
      
      if (data.success) {
        setStockValueProducts(data.data || []);
        setTotalInventoryValue(data.totalInventoryValue || 0);
        setStatusBreakdown(data.statusBreakdown || {});
      }
    } catch (err) {
      console.error('Failed to load stock value report:', err);
    } finally {
      setReportLoading(false);
    }
  };

  const fetchSummaryReport = async () => {
    setReportLoading(true);
    try {
      const token = localStorage.getItem('cms_token');
      const apiUrl = getApiUrl();
      const params = new URLSearchParams({ type: 'summary' });
      
      if (reportFilters.startDate) params.append('startDate', reportFilters.startDate);
      if (reportFilters.endDate) params.append('endDate', reportFilters.endDate);
      
      const response = await fetch(`${apiUrl}/stock.php/reports?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSummaryData(data);
      }
    } catch (err) {
      console.error('Failed to load summary report:', err);
    } finally {
      setReportLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'movements') {
      fetchMovementReport();
    } else if (activeTab === 'low_stock') {
      fetchLowStockReport();
    } else if (activeTab === 'value') {
      fetchStockValueReport();
    } else if (activeTab === 'summary') {
      fetchSummaryReport();
    }
  }, [activeTab, reportFilters]);

  const exportToCSV = (data: any[], filename: string, fieldMap: Record<string, string>) => {
    if (data.length === 0) return;
    
    const headers = Object.keys(fieldMap);
    const csvContent = [
      headers.join(','),
      ...data.map(row => {
        return headers.map(header => {
          const field = fieldMap[header];
          let value = '';
          if (field.includes('.')) {
            const [obj, prop] = field.split('.');
            value = row[obj]?.[prop] || '';
          } else {
            value = row[field] || '';
          }
          // Format dates
          if (field === 'createdAt' && value) {
            value = new Date(value).toLocaleString();
          }
          return `"${String(value).replace(/"/g, '""')}"`;
        }).join(',');
      })
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  if (loading && !stats) {
    return (
      <CMSLayout>
        <div className="cms-stock-page">
          <div className="spinner-container">
            <Spinner animation="border" variant="primary" />
          </div>
        </div>
      </CMSLayout>
    );
  }

  return (
    <CMSLayout>
      <div className="cms-stock-page">
        <div className="stock-header">
          <h1><FaBox className="me-2" />Stock Management</h1>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        {/* Stats Cards */}
        {stats && (
          <Row className="mb-4">
            <Col md={3} sm={6} className="mb-3">
              <Card className="stat-card">
                <Card.Body>
                  <Card.Title className="text-muted small">Products with Stock Tracking</Card.Title>
                  <Card.Text className="h3 mb-0">{stats.totalProductsWithStock}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} sm={6} className="mb-3">
              <Card className="stat-card stat-warning">
                <Card.Body>
                  <Card.Title className="text-muted small">Low Stock</Card.Title>
                  <Card.Text className="h3 mb-0">{stats.lowStockCount}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} sm={6} className="mb-3">
              <Card className="stat-card stat-danger">
                <Card.Body>
                  <Card.Title className="text-muted small">Out of Stock</Card.Title>
                  <Card.Text className="h3 mb-0">{stats.outOfStockCount}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} sm={6} className="mb-3">
              <Card className="stat-card stat-info">
                <Card.Body>
                  <Card.Title className="text-muted small">Active Alerts</Card.Title>
                  <Card.Text className="h3 mb-0">{stats.totalAlerts}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        {/* Tabs for Reports */}
        <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'alerts')}>
          <Nav variant="tabs" className="mb-3">
            <Nav.Item>
              <Nav.Link eventKey="alerts">
                <FaExclamationTriangle className="me-2" />
                Alerts
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="movements">
                <FaList className="me-2" />
                Movements
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="low_stock">
                <FaChartBar className="me-2" />
                Low Stock Report
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="value">
                <FaDollarSign className="me-2" />
                Stock Value
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="summary">
                <FaChartLine className="me-2" />
                Summary
              </Nav.Link>
            </Nav.Item>
          </Nav>

          <Tab.Content>
            {/* Alerts Tab */}
            <Tab.Pane eventKey="alerts">
              <div className="stock-actions mb-3">
                <Row>
                  <Col md={6}>
                    <Form.Select
                      value={alertTypeFilter}
                      onChange={(e) => setAlertTypeFilter(e.target.value)}
                    >
                      <option value="">All Alert Types</option>
                      <option value="low_stock">Low Stock</option>
                      <option value="out_of_stock">Out of Stock</option>
                      <option value="backorder">Backorder</option>
                    </Form.Select>
                  </Col>
                  <Col md={6} className="text-end">
                    <Button
                      variant="primary"
                      onClick={() => setShowBulkAdjustModal(true)}
                      className="ms-2"
                    >
                      <FaChartLine className="me-2" />
                      Bulk Adjust Stock
                    </Button>
                  </Col>
                </Row>
              </div>

              <Card>
                <Card.Header>
                  <h5 className="mb-0">Stock Alerts</h5>
                </Card.Header>
                <Card.Body>
                  {loading ? (
                    <div className="text-center py-4">
                      <Spinner animation="border" variant="primary" />
                    </div>
                  ) : alerts.length === 0 ? (
                    <Alert variant="info" className="mb-0">
                      <FaCheckCircle className="me-2" />
                      No active stock alerts
                    </Alert>
                  ) : (
                    <Table responsive striped hover>
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Alert Type</th>
                          <th>Current Stock</th>
                          <th>Created</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {alerts.map((alert) => (
                          <tr key={alert.id}>
                            <td>{alert.productName}</td>
                            <td>
                              <Badge bg={getAlertBadgeVariant(alert.alertType)}>
                                {getAlertTypeLabel(alert.alertType)}
                              </Badge>
                            </td>
                            <td>
                              <strong>{alert.stockQuantity}</strong>
                            </td>
                            <td>{new Date(alert.createdAt).toLocaleDateString()}</td>
                            <td>
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => {
                                  setSelectedAlert(alert);
                                  setShowResolveModal(true);
                                }}
                              >
                                Resolve
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </Card.Body>
              </Card>
            </Tab.Pane>

            {/* Movements Tab */}
            <Tab.Pane eventKey="movements">
              <Card>
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Stock Movement Report</h5>
                  <Button
                    variant="outline-success"
                    size="sm"
                    onClick={() => exportToCSV(
                      movements,
                      `stock-movements-${new Date().toISOString().split('T')[0]}.csv`,
                      {
                        'Date': 'createdAt',
                        'Product': 'productName',
                        'Type': 'movementType',
                        'Quantity': 'quantity',
                        'Previous': 'previousQuantity',
                        'New': 'newQuantity',
                        'Reference': 'referenceId',
                        'Notes': 'notes',
                        'User': 'createdByName'
                      }
                    )}
                    disabled={movements.length === 0}
                  >
                    <FaFileExport className="me-2" />
                    Export CSV
                  </Button>
                </Card.Header>
                <Card.Body>
                  <Row className="mb-3">
                    <Col md={3}>
                      <Form.Label>Start Date</Form.Label>
                      <Form.Control
                        type="date"
                        value={reportFilters.startDate}
                        onChange={(e) => setReportFilters({ ...reportFilters, startDate: e.target.value })}
                      />
                    </Col>
                    <Col md={3}>
                      <Form.Label>End Date</Form.Label>
                      <Form.Control
                        type="date"
                        value={reportFilters.endDate}
                        onChange={(e) => setReportFilters({ ...reportFilters, endDate: e.target.value })}
                      />
                    </Col>
                    <Col md={3}>
                      <Form.Label>Movement Type</Form.Label>
                      <Form.Select
                        value={reportFilters.movementType}
                        onChange={(e) => setReportFilters({ ...reportFilters, movementType: e.target.value })}
                      >
                        <option value="">All Types</option>
                        <option value="purchase">Purchase</option>
                        <option value="sale">Sale</option>
                        <option value="adjustment">Adjustment</option>
                        <option value="return">Return</option>
                        <option value="damaged">Damaged</option>
                        <option value="transfer">Transfer</option>
                      </Form.Select>
                    </Col>
                    <Col md={3}>
                      <Form.Label>Limit</Form.Label>
                      <Form.Control
                        type="number"
                        value={reportFilters.limit}
                        onChange={(e) => setReportFilters({ ...reportFilters, limit: parseInt(e.target.value) || 100 })}
                      />
                    </Col>
                  </Row>

                  {Object.keys(movementTotals).length > 0 && (
                    <Row className="mb-3">
                      <Col>
                        <Card className="bg-light">
                          <Card.Body>
                            <h6>Totals by Type:</h6>
                            <div className="d-flex flex-wrap gap-3">
                              {Object.entries(movementTotals).map(([type, total]: [string, any]) => (
                                <Badge key={type} bg="secondary" className="p-2">
                                  {type}: {total}
                                </Badge>
                              ))}
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                  )}

                  {reportLoading ? (
                    <div className="text-center py-4">
                      <Spinner animation="border" variant="primary" />
                    </div>
                  ) : movements.length === 0 ? (
                    <Alert variant="info">No movements found</Alert>
                  ) : (
                    <Table responsive striped hover>
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Product</th>
                          <th>Type</th>
                          <th>Quantity</th>
                          <th>Previous</th>
                          <th>New</th>
                          <th>Reference</th>
                          <th>Notes</th>
                          <th>User</th>
                        </tr>
                      </thead>
                      <tbody>
                        {movements.map((movement) => (
                          <tr key={movement.id}>
                            <td>{new Date(movement.createdAt).toLocaleString()}</td>
                            <td>{movement.productName}</td>
                            <td>
                              <Badge bg={movement.quantity > 0 ? 'success' : 'danger'}>
                                {movement.movementType}
                              </Badge>
                            </td>
                            <td>{movement.quantity > 0 ? '+' : ''}{movement.quantity}</td>
                            <td>{movement.previousQuantity}</td>
                            <td><strong>{movement.newQuantity}</strong></td>
                            <td>{movement.referenceId || '-'}</td>
                            <td>{movement.notes || '-'}</td>
                            <td>{movement.createdByName || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </Card.Body>
              </Card>
            </Tab.Pane>

            {/* Low Stock Report Tab */}
            <Tab.Pane eventKey="low_stock">
              <Card>
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Low Stock Products Report</h5>
                  <Button
                    variant="outline-success"
                    size="sm"
                    onClick={() => exportToCSV(
                      lowStockProducts,
                      `low-stock-report-${new Date().toISOString().split('T')[0]}.csv`,
                      {
                        'Product': 'name',
                        'Current Stock': 'stockQuantity',
                        'Threshold': 'lowStockThreshold',
                        'Status': 'stockStatus',
                        'Recommended Order': 'recommendedOrder',
                        'Current Value': 'currentValue'
                      }
                    )}
                    disabled={lowStockProducts.length === 0}
                  >
                    <FaFileExport className="me-2" />
                    Export CSV
                  </Button>
                </Card.Header>
                <Card.Body>
                  {reportLoading ? (
                    <div className="text-center py-4">
                      <Spinner animation="border" variant="primary" />
                    </div>
                  ) : lowStockProducts.length === 0 ? (
                    <Alert variant="success">No low stock products</Alert>
                  ) : (
                    <Table responsive striped hover>
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Current Stock</th>
                          <th>Threshold</th>
                          <th>Status</th>
                          <th>Recommended Order</th>
                          <th>Current Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lowStockProducts.map((product) => (
                          <tr key={product.id}>
                            <td>{product.name}</td>
                            <td><strong>{product.stockQuantity}</strong></td>
                            <td>{product.lowStockThreshold}</td>
                            <td>
                              <Badge bg={product.stockStatus === 'out_of_stock' ? 'danger' : 'warning'}>
                                {product.stockStatus === 'out_of_stock' ? 'Out of Stock' : 'Low Stock'}
                              </Badge>
                            </td>
                            <td><strong>{product.recommendedOrder}</strong></td>
                            <td>{formatCurrency(product.currentValue)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </Card.Body>
              </Card>
            </Tab.Pane>

            {/* Stock Value Tab */}
            <Tab.Pane eventKey="value">
              <Card>
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Stock Value Report</h5>
                  <Button
                    variant="outline-success"
                    size="sm"
                    onClick={() => exportToCSV(
                      stockValueProducts,
                      `stock-value-report-${new Date().toISOString().split('T')[0]}.csv`,
                      {
                        'Product': 'name',
                        'Quantity': 'stockQuantity',
                        'Unit Price': 'price',
                        'Total Value': 'totalValue',
                        'Status': 'stockStatus'
                      }
                    )}
                    disabled={stockValueProducts.length === 0}
                  >
                    <FaFileExport className="me-2" />
                    Export CSV
                  </Button>
                </Card.Header>
                <Card.Body>
                  <Row className="mb-4">
                    <Col md={6}>
                      <Card className="bg-primary text-white">
                        <Card.Body>
                          <Card.Title className="text-white">Total Inventory Value</Card.Title>
                          <Card.Text className="h3 mb-0">{formatCurrency(totalInventoryValue)}</Card.Text>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={6}>
                      <Card>
                        <Card.Body>
                          <Card.Title>Status Breakdown</Card.Title>
                          {Object.entries(statusBreakdown).map(([status, data]: [string, any]) => (
                            <div key={status} className="mb-2">
                              <strong>{status.replace('_', ' ').toUpperCase()}:</strong> {data.count} products - {formatCurrency(data.value)}
                            </div>
                          ))}
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>

                  {reportLoading ? (
                    <div className="text-center py-4">
                      <Spinner animation="border" variant="primary" />
                    </div>
                  ) : stockValueProducts.length === 0 ? (
                    <Alert variant="info">No products with stock tracking enabled</Alert>
                  ) : (
                    <Table responsive striped hover>
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Quantity</th>
                          <th>Unit Price</th>
                          <th>Total Value</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stockValueProducts.map((product) => (
                          <tr key={product.id}>
                            <td>{product.name}</td>
                            <td>{product.stockQuantity}</td>
                            <td>{formatCurrency(product.price)}</td>
                            <td><strong>{formatCurrency(product.totalValue)}</strong></td>
                            <td>
                              <Badge bg={product.stockStatus === 'in_stock' ? 'success' : 
                                       product.stockStatus === 'low_stock' ? 'warning' : 
                                       product.stockStatus === 'out_of_stock' ? 'danger' : 'info'}>
                                {product.stockStatus.replace('_', ' ')}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </Card.Body>
              </Card>
            </Tab.Pane>

            {/* Summary Tab */}
            <Tab.Pane eventKey="summary">
              <Card>
                <Card.Header>
                  <h5 className="mb-0">Stock Summary Report</h5>
                </Card.Header>
                <Card.Body>
                  <Row className="mb-3">
                    <Col md={6}>
                      <Form.Label>Start Date</Form.Label>
                      <Form.Control
                        type="date"
                        value={reportFilters.startDate}
                        onChange={(e) => setReportFilters({ ...reportFilters, startDate: e.target.value })}
                      />
                    </Col>
                    <Col md={6}>
                      <Form.Label>End Date</Form.Label>
                      <Form.Control
                        type="date"
                        value={reportFilters.endDate}
                        onChange={(e) => setReportFilters({ ...reportFilters, endDate: e.target.value })}
                      />
                    </Col>
                  </Row>

                  {reportLoading ? (
                    <div className="text-center py-4">
                      <Spinner animation="border" variant="primary" />
                    </div>
                  ) : !summaryData ? (
                    <Alert variant="info">Loading summary report...</Alert>
                  ) : (
                    <>
                      <Row className="mb-4">
                        <Col>
                          <Card>
                            <Card.Header>
                              <h6>Movement Summary by Type</h6>
                            </Card.Header>
                            <Card.Body>
                              <Table striped>
                                <thead>
                                  <tr>
                                    <th>Type</th>
                                    <th>Count</th>
                                    <th>Total Quantity</th>
                                    <th>In</th>
                                    <th>Out</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {summaryData.summary?.map((item: any) => (
                                    <tr key={item.movementType}>
                                      <td><strong>{item.movementType}</strong></td>
                                      <td>{item.movementCount}</td>
                                      <td>{item.totalQuantity}</td>
                                      <td className="text-success">{item.totalIn}</td>
                                      <td className="text-danger">{item.totalOut}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </Table>
                            </Card.Body>
                          </Card>
                        </Col>
                      </Row>

                      <Row>
                        <Col>
                          <Card>
                            <Card.Header>
                              <h6>Top Products by Movement Activity</h6>
                            </Card.Header>
                            <Card.Body>
                              <Table striped>
                                <thead>
                                  <tr>
                                    <th>Product</th>
                                    <th>Movement Count</th>
                                    <th>Total Movement</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {summaryData.topProducts?.map((product: any) => (
                                    <tr key={product.id}>
                                      <td>{product.name}</td>
                                      <td>{product.movementCount}</td>
                                      <td>{product.totalMovement}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </Table>
                            </Card.Body>
                          </Card>
                        </Col>
                      </Row>
                    </>
                  )}
                </Card.Body>
              </Card>
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>

        {/* Resolve Alert Modal */}
        <Modal show={showResolveModal} onHide={() => {
          setShowResolveModal(false);
          setSelectedAlert(null);
          setResolveNotes('');
        }}>
          <Modal.Header closeButton>
            <Modal.Title>Resolve Stock Alert</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedAlert && (
              <>
                <p><strong>Product:</strong> {selectedAlert.productName}</p>
                <p><strong>Alert Type:</strong> {getAlertTypeLabel(selectedAlert.alertType)}</p>
                <p><strong>Current Stock:</strong> {selectedAlert.stockQuantity}</p>
                <Form.Group className="mt-3">
                  <Form.Label>Resolution Notes (Optional)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={resolveNotes}
                    onChange={(e) => setResolveNotes(e.target.value)}
                    placeholder="Add notes about how this alert was resolved..."
                  />
                </Form.Group>
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => {
                setShowResolveModal(false);
                setSelectedAlert(null);
                setResolveNotes('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleResolveAlert}
              disabled={resolving}
            >
              {resolving ? 'Resolving...' : 'Resolve Alert'}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Bulk Adjust Stock Modal */}
        <Modal show={showBulkAdjustModal} onHide={() => setShowBulkAdjustModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Bulk Stock Adjustment</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Alert variant="info">
              Enter a positive number to increase stock, or a negative number to decrease stock.
            </Alert>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Product ID</Form.Label>
                <Form.Control
                  type="number"
                  value={bulkAdjustData.productId}
                  onChange={(e) => setBulkAdjustData({ ...bulkAdjustData, productId: e.target.value })}
                  placeholder="Enter product ID"
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Quantity Change</Form.Label>
                <Form.Control
                  type="number"
                  value={bulkAdjustData.quantity || ''}
                  onChange={(e) => setBulkAdjustData({ ...bulkAdjustData, quantity: parseInt(e.target.value) || 0 })}
                  placeholder="e.g., 10 or -5"
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Movement Type</Form.Label>
                <Form.Select
                  value={bulkAdjustData.movementType}
                  onChange={(e) => setBulkAdjustData({ ...bulkAdjustData, movementType: e.target.value as any })}
                >
                  <option value="adjustment">Manual Adjustment</option>
                  <option value="purchase">Purchase/Receipt</option>
                  <option value="return">Return</option>
                  <option value="damaged">Damaged/Loss</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Notes (Optional)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={bulkAdjustData.notes}
                  onChange={(e) => setBulkAdjustData({ ...bulkAdjustData, notes: e.target.value })}
                  placeholder="Add notes about this stock adjustment..."
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowBulkAdjustModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleBulkAdjust}
              disabled={adjusting}
            >
              {adjusting ? 'Adjusting...' : 'Adjust Stock'}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </CMSLayout>
  );
};

