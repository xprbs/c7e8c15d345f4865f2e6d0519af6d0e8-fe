import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Card,
    Grid,
    TextField,
    Typography,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    CircularProgress,
    FormHelperText,
} from '@mui/material';
import { useRouter } from 'next/router';
import { backendApi } from 'src/configs/axios';
import axios from 'axios';

const AFFormRegistration = () => {
    const router = useRouter();
    const { id } = router.query;
    const isEdit = Boolean(id);

    const [formData, setFormData] = useState({
        productId: '',
        item_type: '',
        uom: '',
        ditem_type: '',
        ditem_category: '',
        item_description: '',
        sub_type: '',
        dimension: '',
        storage: '',
        reservation: '',
    });

    const [uomOptions, setUomOptions] = useState([]);
    const [typeOptions, setTypeOptions] = useState([]);
    const [rawTypeOptions, setRawTypeOptions] = useState([]);
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [storageOptions, setStorageOptions] = useState([]);
    const [reservationOptions, setReservationOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [token, setToken] = useState(null);

    const [formErrors, setFormErrors] = useState({
        item_type: '',
        uom: '',
        ditem_type: '',
        ditem_category: '',
        item_description: '',
        sub_type: '',
        dimension: '',
        storage: '',
        reservation: '',
    });

    // Validation function
    const validateForm = () => {
        let errors = {};
        let isValid = true;

        // Check required fields
        if (!formData.item_type) {
            errors.item_type = 'Item Group is required';
            isValid = false;
        }
        if (!formData.uom) {
            errors.uom = 'UOM is required';
            isValid = false;
        }
        if (!formData.ditem_type) {
            errors.ditem_type = 'Type is required';
            isValid = false;
        }
        if (!formData.ditem_category) {
            errors.ditem_category = 'Category is required';
            isValid = false;
        }
        if (!formData.item_description) {
            errors.item_description = 'Description is required';
            isValid = false;
        }
        if (!formData.sub_type) {
            errors.sub_type = 'Sub Type is required';
            isValid = false;
        }
        if (!formData.dimension) {
            errors.dimension = 'Dimension is required';
            isValid = false;
        }
        if (!formData.storage) {
            errors.storage = 'Storage is required';
            isValid = false;
        }
        if (!formData.reservation) {
            errors.reservation = 'Reservation is required';
            isValid = false;
        }

        setFormErrors(errors);
        return isValid;
    };

    const getToken = async () => {
        const url = 'http://apidev.samora.co.id/api/samora-srv2/auth/login';
        try {
            const body = {
                username: 'samora-api',
                password: 'SamoraBer1',
            };

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch token');
            }
            const data = await response.json();
            return data.access_token;
        } catch (error) {
            console.log('Error fetching data', error.message);
        }
    };

    const fetchUom = async (token) => {
        try {
            const url = 'http://apidev.samora.co.id/api/samora-srv2/dynamic/master-data/UnitOfMeasure';
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch UOM');
            }

            const data = await response.json();
            return data.data;
        } catch (error) {
            console.log('Failed to fetch UOM', error.message);
        }
    };

    const fetchStorage = async () => {
        try {
            const response = await backendApi.get('/web/storages');
            const data = response.data;
            return data;
        } catch (error) {
            console.log('Failed to fetch Storage', error.message);
        }
    };

    const fetchType = async (token) => {
        try {
            const url = 'http://apidev.samora.co.id/api/samora-srv2/dynamic/master-data/ProductCategories';
            const response = await axios(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.status !== 200) {
                throw new Error('Failed to fetch types');
            }
            const data = response.data.data;
            const uniqueParentCodes = new Set();
            const uniqueData = data.filter(item => {
                if (!uniqueParentCodes.has(item.ParentProductCategoryCode)) {
                    uniqueParentCodes.add(item.ParentProductCategoryCode);
                    return true;
                }
                return false;
            });
            setRawTypeOptions(data);
            return uniqueData;
        } catch (error) {
            console.log('Failed to fetch types', error.message);
        }
    };

    const fetchReservations = async (storage) => {
        // This function fetches reservation options based on the selected storage
        try {
            // Simulated API request based on storage value
            const response = await backendApi.get(`/api/reservations?storage=${storage}`);
            const data = response.data;
            return data;
        } catch (error) {
            console.log('Failed to fetch reservations', error.message);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = await getToken();
            if (token) {
                const uom = await fetchUom(token);
                const type = await fetchType(token);
                setToken(token);
                setUomOptions(uom);
                setTypeOptions(type);
            }
            const storage = await fetchStorage();
            setStorageOptions(storage);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        if (name == 'dcategory') {
            const selectedCategory = categoryOptions.find(category => category.CategoryCode === value);
            console.log(selectedCategory.CategoryName);
            setFormData(prevState => ({
                ...prevState,
                ditem_category: selectedCategory.CategoryName,
                dcategory: value
            }));
        } else {
            setFormData(prevState => ({ ...prevState, [name]: value }));
        }
    };

    const handleInputDescriptionChange = (event) => {
        const { name, value } = event.target;
        setFormData(prevState => ({ ...prevState, [name]: value.toUpperCase() }));
    };

    const handleTypeChange = async (event) => {
        const { value } = event.target;
        setFormData(prevState => ({ ...prevState, type: value, ditem_type: value }));

        try {
            const data = rawTypeOptions;
            const filteredData = data.filter(item => item.ParentProductCategoryCode === value);
            setCategoryOptions(filteredData);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSubTypeChange = (event) => {
        const { value } = event.target;
        setFormData(prevState => ({ ...prevState, sub_type: value }));

        if (value === 'ProductMaster') {
            setFormData(prevState => ({ ...prevState, dimension: 'Config | Size | Material/Color | Style' }));
        } else {
            setFormData(prevState => ({ ...prevState, dimension: '-' }));
        }
    };

    const handleStorageChange = async (event) => {
        const { value } = event.target;
        setFormData(prevState => ({ ...prevState, storage: value }));

        // Determine reservation options based on selected storage
        let reservations = [];
        if (['S', 'SW', 'SWL'].includes(value)) {
            reservations = [{ value: 'N', label: 'N' }];
        } else if (value === 'WMS') {
            reservations = [{ value: 'N', label: 'N' }, { value: 'B', label: 'B' }];
        }
        setReservationOptions(reservations);
        setFormData(prevState => ({ ...prevState, reservation: reservations.length > 0 ? reservations[0].value : '' }));
    };

    const handleJustSubmit = async (event, status) => {
        event.preventDefault();
        setLoading(true);

        try {
            const user = JSON.parse(localStorage.getItem('userData'));
            const updatedFormData = {
                ...formData,
                company: 'AFD',
                created_by: user.name,
                trans_type: 'INSERT',
                ditem_product: formData.item_description,
            };
            if (updatedFormData.dimension === 'Config | Size | Material/Color | Style') {
                updatedFormData.dimension = 'CoSiMaSt';
            }

            const response = await backendApi.post('/web/items/create', updatedFormData);
            const newItem = response.data;

            const logData = {
                id_item: newItem.id_item,
                type: 'SUBMIT',
                message: newItem.item_description,
                created_by: user.name
            };

            await backendApi.post('/web/log-items/create', logData);
            router.push('/item/anf-registration');
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveAndSubmit = async (event) => {
        event.preventDefault();
        if (!validateForm()) return;
        setLoading(true);

        try {
            const user = JSON.parse(localStorage.getItem('userData'));

            const updatedFormData = {
                ...formData,
                status_cotte: 3,
                company: 'AFD',
                created_by: user.name,
                trans_type: 'INSERT',
                ditem_product: formData.item_description,
            };
            if (updatedFormData.dimension === 'Config | Size | Material/Color | Style') {
                updatedFormData.dimension = 'CoSiMaSt';
            }

            const response = await backendApi.post('/web/items/create', updatedFormData);
            const newItem = response.data;

            const logData = {
                id_item: newItem.id_item,
                type: 'SUBMIT',
                message: newItem.item_description,
                created_by: user.name
            };

            await backendApi.post('/web/log-items/create', logData);
            router.push('/item/anf-registration');
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <Box p={4}>
                <Typography variant='h5' gutterBottom>
                    {isEdit ? 'Edit Item' : 'Create Item'}
                </Typography>
                <form onSubmit={(e) => handleSubmit(e, 1)}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                            <TextField
                                label='Product ID'
                                // name='productId'
                                value={formData.productId}
                                onChange={handleInputChange}
                                InputProps={{ readOnly: true }}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <FormControl fullWidth error={Boolean(formErrors.item_type)}>
                                <InputLabel>Item Group</InputLabel>
                                <Select
                                    label='Item Group'
                                    name='item_type'
                                    value={formData.item_type}
                                    onChange={handleInputChange}
                                >
                                    <MenuItem value='Item'>Item</MenuItem>
                                    <MenuItem value='Service'>Service</MenuItem>
                                </Select>
                                {formErrors.item_type && <Typography color="error">{formErrors.item_type}</Typography>}
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <FormControl fullWidth error={Boolean(formErrors.uom)}>
                                <InputLabel>UOM</InputLabel>
                                <Select
                                    label='UOM'
                                    name='uom'
                                    value={formData.uom}
                                    onChange={handleInputChange}
                                >
                                    {uomOptions.map(option => (
                                        <MenuItem key={option.UnitSymbol} value={option.UnitSymbol}>
                                            {option.TranslatedDescription}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {formErrors.uom && <Typography color="error">{formErrors.uom}</Typography>}
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <FormControl fullWidth error={Boolean(formErrors.ditem_type)}>
                                <InputLabel>Type</InputLabel>
                                <Select
                                    name='ditem_type'
                                    value={formData.ditem_type}
                                    onChange={handleTypeChange}
                                >
                                    {typeOptions && typeOptions.map(type => (
                                        <MenuItem key={type.ParentProductCategoryCode} value={type.ParentProductCategoryCode}>
                                            {type.ParentProductCategoryName} - {type.ParentProductCategoryCode}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {formErrors.ditem_type && <Typography color="error">{formErrors.ditem_type}</Typography>}
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <FormControl fullWidth error={Boolean(formErrors.dcategory)}>
                                <InputLabel>Category</InputLabel>
                                <Select
                                    name='dcategory'
                                    value={formData.dcategory}
                                    onChange={handleInputChange}
                                >
                                    {categoryOptions.map(category => (
                                        <MenuItem key={category.CategoryCode} value={category.CategoryCode}>
                                            {category.CategoryName}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {formErrors.dcategory && <Typography color="error">{formErrors.dcategory}</Typography>}
                            </FormControl>
                        </Grid>
                        <input
                            type="hidden"
                            name="ditem_category"
                            value={formData.ditem_category || ''}
                        />
                        <Grid item xs={12}>
                            <TextField
                                label='Description'
                                name='item_description'
                                value={formData.item_description}
                                onChange={handleInputDescriptionChange}
                                error={!!formErrors.item_description}
                                helperText={formErrors.item_description}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <FormControl fullWidth error={Boolean(formErrors.sub_type)}>
                                <InputLabel>Sub Type</InputLabel>
                                <Select
                                    label='Sub Type'
                                    name='sub_type'
                                    value={formData.sub_type}
                                    onChange={handleSubTypeChange}
                                >
                                    <MenuItem value='ProductMaster'>Product Master</MenuItem>
                                    <MenuItem value='Product'>Product</MenuItem>
                                </Select>
                                {formErrors.sub_type && <Typography color="error">{formErrors.sub_type}</Typography>}
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField
                                label='Dimension'
                                name='dimension'
                                value={formData.dimension}
                                onChange={handleInputChange}
                                error={!!formErrors.dimension}
                                helperText={formErrors.dimension}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <FormControl fullWidth error={Boolean(formErrors.storage)}>
                                <InputLabel>Storage</InputLabel>
                                <Select
                                    label='Storage'
                                    name='storage'
                                    value={formData.storage}
                                    onChange={handleStorageChange}
                                >
                                    {storageOptions.map(option => (
                                        <MenuItem key={option.storageid} value={option.storageid}>
                                            {option.storagename}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {formErrors.storage && <Typography color="error">{formErrors.storage}</Typography>}
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <FormControl fullWidth error={Boolean(formErrors.reservation)}>
                                <InputLabel>Reservation</InputLabel>
                                <Select
                                    label='Reservation'
                                    name='reservation'
                                    value={formData.reservation}
                                    onChange={handleInputChange}
                                >
                                    {reservationOptions.map(option => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {formErrors.reservation && <Typography color="error">{formErrors.reservation}</Typography>}
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Button variant='outlined' onClick={() => router.push('/item/anf-registration')}>
                                Back
                            </Button>
                            <Box style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                                {/* <Button type='submit' variant='contained' color='primary' onClick={handleJustSubmit}>
                                    Submit
                                </Button> */}
                                <Button
                                    variant='contained'
                                    color='primary'
                                    onClick={handleSaveAndSubmit}
                                    style={{ marginLeft: 10 }}
                                >
                                    Submit And Approval
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </form>
            </Box>
        </Card>
    );
};

AFFormRegistration.acl = {
    action: 'manage',
    subject: 'anf-registration-form'
};

export default AFFormRegistration;
